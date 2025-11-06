import { on } from "node:events";
import type { TRPCRouterRecord } from "@trpc/server";
import { tracked, TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import type { CallSignalEvent, ChatMessageEvent } from "../lib/redis";
import { pub, sub } from "../lib/redis";
import { protectedProcedure } from "../trpc";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObject = Record<string, any>;

function userIdChannelId(userId: string) {
  return `chat:msg:${userId}`;
}

function callChannelId(userId: string) {
  return `chat:call:${userId}`;
}

export const chatRouter = {
  onMessage: protectedProcedure.subscription(async function* (opts) {
    const userId = opts.ctx.session.user.id;
    const channel = userIdChannelId(userId);

    await sub.subscribe(channel);

    try {
      // ioredis EventEmitter -> async iterator
      for await (const [ch, raw] of on(sub, "message", {
        signal: opts.signal,
      })) {
        if (ch !== channel) continue;
        const msg = JSON.parse(raw as string) as ChatMessageEvent;

        // tracked(id, payload) = automatic resumption/lastEventId support
        yield tracked(msg.id.toString(), msg);
      }
    } finally {
      // unsubscribe and cleanup when client disconnects
      try {
        await sub.unsubscribe(channel);
      } catch {
        // ignore unsubscribe errors
      }
    }
  }),
  getConversations: protectedProcedure
    .input(
      z.object({
        page: z.number().optional().default(0),
        limit: z.number().optional().default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/list`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page: input.page,
            page_size: input.limit,
          }),
        },
      );

      const result = (await response.json()) as {
        status: "success" | "error";
        data: {
          search: string | null;
          list: {
            id: number;
            unviewed: number;
            users: {
              id: number;
              email: string;
              first_name: string;
              last_name: string;
              full_name: string;
              photo: string | null;
              friend_status: string;
              is_deleted: boolean;
            }[];
            last_message: {
              id: number;
              id_user: number;
              is_my: boolean;
              message: string;
              files: string[];
              is_viewed: boolean;
              created_at: string;
              received_at: string;
            } | null;
          }[];
          count: number;
          page: number;
          page_size: number;
        };
        error?: {
          message: string;
          code: string | number | null;
        };
      };

      if (result.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error?.message ?? "Failed to fetch conversations",
        });
      }

      return result.data;
    }),

  getMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        limit: z.number().optional().default(100),
        cursor: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/chat-messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: input.conversationId,
            page_size: input.limit,
            page: input.cursor,
          }),
        },
      );

      const result = (await response.json()) as {
        status: "success" | "error";
        data: {
          id: number;
          list: {
            id: number;
            id_user: number;
            is_my: boolean;
            message: string;
            files: string[];
            is_viewed: boolean;
            created_at: string;
            received_at: string;
          }[];
          count: number;
          page: number;
          page_size: number;
        };
        error?: {
          message: string;
          code: string | number | null;
        };
      };

      if (result.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error?.message ?? "Failed to fetch messages",
        });
      }

      return result.data;
      // return {
      //   ...result.data,
      //   list: result.data.list.map((message) => ({
      //     ...message,
      //     received_at: new Date(message.received_at).toISOString(),
      //     created_at: new Date(message.created_at).toISOString(),
      //   })),
      // };
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.number().optional(),
        userId: z.number().optional(),
        message: z.string().min(1).max(5000),
        createdAt: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.conversationId && !input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Either conversationId or userId must be provided",
        });
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/send-message`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_conversation: input.conversationId,
            message_token: crypto.randomUUID(),
            message: input.message,
            created_at: input.createdAt,
          }),
        },
      );

      const result = (await response.json()) as {
        status: "success" | "error";
        data: {
          id: number;
          id_conversation: number;
          id_user: number;
          is_my: boolean;
          message: string;
          files: string[];
          is_viewed: boolean;
          created_at: string;
          received_at: string;
          userIds: number[];
          user: {
            id: number;
            first_name: string;
            last_name: string;
            full_name: string;
            photo: string | null;
          };
        };
        error?: {
          message: string;
          code: string | number | null;
        };
      };

      if (result.status !== "success") {
        console.error(result.error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error?.message ?? "Failed to send message",
        });
      }

      // publish to subscribers for this conversation
      try {
        const notificationUserIds = result.data.userIds.filter(
          (id) => id !== result.data.id_user,
        );
        for (const userId of notificationUserIds) {
          await pub.publish(
            userIdChannelId(userId.toString()),
            JSON.stringify({
              ...result.data,
              is_my: false,
            }),
          );
        }
      } catch (_) {
        // ignore pubsub errors
        console.error("error publishing to channel", _);
      }

      return result.data;
    }),

  getOrCreateConversation: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        limit: z.number().optional().default(100),
        cursor: z.number().optional().default(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/get-friend-chat`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_user: input.userId,
            limit: input.limit,
            cursor: input.cursor,
          }),
        },
      );

      const result = (await response.json()) as {
        status: "success" | "error";
        data: {
          id: number;
          list: {
            id: number;
            id_user: number;
            is_my: boolean;
            message: string;
            files: string[];
            is_viewed: boolean;
            created_at: string;
            received_at: string;
          }[];
          count: number;
          page: number;
          page_size: number;
        };
        error?: {
          message: string;
          code: string | number | null;
        };
      };

      if (result.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error?.message ?? "Failed to create conversation",
        });
      }

      return result.data;
    }),
  getFriendChat: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        limit: z.number().optional().default(100),
        cursor: z.number().optional().default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/get-friend-chat`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ctx.session.session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_user: input.userId,
            page_size: input.limit,
            page: input.cursor,
          }),
        },
      );

      const result = (await response.json()) as {
        status: "success" | "error";
        data: {
          id: number;
          list: {
            id: number;
            id_user: number;
            is_my: boolean;
            message: string;
            files: string[];
            is_viewed: boolean;
            created_at: string;
            received_at: string;
          }[];
          count: number;
          page: number;
          page_size: number;
        };
        error?: {
          message: string;
          code: string | number | null;
        };
      };

      if (result.status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error?.message ?? "Failed to fetch messages",
        });
      }

      return result.data;
    }),

  onCallSignal: protectedProcedure.subscription(async function* (opts) {
    const userId = opts.ctx.session.user.id;
    const channel = callChannelId(userId);

    await sub.subscribe(channel);

    try {
      for await (const [ch, raw] of on(sub, "message", {
        signal: opts.signal,
      }) as NodeJS.AsyncIterator<[string, string]>) {
        if (ch !== channel) continue;
        const signal = JSON.parse(raw) as CallSignalEvent;

        // tracked(id, payload) = automatic resumption/lastEventId support
        yield tracked(`${signal.type}-${Date.now()}`, signal);
      }
    } finally {
      // unsubscribe and cleanup when client disconnects
      try {
        await sub.unsubscribe(channel);
      } catch {
        // ignore unsubscribe errors
      }
    }
  }),

  sendCallSignal: protectedProcedure
    .input(
      z.object({
        type: z.enum([
          "offer",
          "answer",
          "ice-candidate",
          "call-init",
          "call-end",
        ]),
        // fromUserId: z.number(),
        fromUserName: z.string().optional(),
        fromUserPhoto: z.string().optional(),
        toUserId: z.union([z.number(), z.string()]),
        callType: z.enum(["video", "voice"]),
        signal: z.custom<AnyObject>().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const toChannel = callChannelId(input.toUserId.toString());

      try {
        await pub.publish(
          toChannel,
          JSON.stringify({
            type: input.type,
            fromUserId: ctx.session.user.id,
            fromUserName: input.fromUserName,
            fromUserPhoto: input.fromUserPhoto,
            toUserId: +input.toUserId,
            callType: input.callType,
            signal: input.signal,
          }),
        );
      } catch (error) {
        console.error("error publishing call signal", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send call signal",
        });
      }

      return { success: true };
    }),
} satisfies TRPCRouterRecord;
