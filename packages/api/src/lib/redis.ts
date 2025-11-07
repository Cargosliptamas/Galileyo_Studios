import type { SignalData } from "simple-peer";
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

export const pub = new Redis(REDIS_URL);
export const sub = new Redis(REDIS_URL);

export interface ChatMessageEvent {
  id: number;
  id_conversation: number;
  id_user: number;
  is_my: boolean;
  is_system: boolean;
  metadata?: {
    isAnswered: boolean;
    time: number;
  } | null;
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
}

export type CallType = "video" | "voice";
export interface CallSignalEvent {
  type: "offer" | "answer" | "ice-candidate" | "call-init" | "call-end";
  fromUserId: number;
  fromUserName: string;
  fromUserPhoto?: string | null;
  toUserId: number | string;
  callType: CallType;
  signal?: SignalData;
}
