"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod/v4";

import type { PrivateFeedType } from "@galileyo/validators/feed";
import { Button } from "@galileyo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@galileyo/ui/form";
import { Input } from "@galileyo/ui/input";
import { toast } from "@galileyo/ui/toast";

import { useTRPC } from "~/trpc/react";

const InviteFormSchema = z
  .object({
    email: z.string().email().optional().or(z.literal("")),
    phone_number: z.string().optional().or(z.literal("")),
    name: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      const hasEmail = data.email && data.email.trim() !== "";
      const hasPhone = data.phone_number && data.phone_number.trim() !== "";
      return hasEmail ?? hasPhone;
    },
    {
      message: "Either email or phone number is required",
      path: ["email"],
    },
  );

type InviteFormType = z.infer<typeof InviteFormSchema>;

export function PrivateFeedInviteDialog({
  feed,
  isOpen,
  onOpenChange,
  onSuccess,
}: {
  feed: PrivateFeedType | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const inviteForm = useForm({
    schema: InviteFormSchema,
    defaultValues: {
      email: "",
      phone_number: "",
      name: "",
    },
  });

  const inviteMutation = useMutation(
    trpc.myFeeds.private.invite.mutationOptions({
      onSuccess: async () => {
        inviteForm.reset();
        await queryClient.invalidateQueries({
          queryKey: trpc.myFeeds.private.getInvites.pathFilter({}).queryKey,
        });
        toast.success("Invite sent successfully");
        onSuccess?.();
        onOpenChange(false);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to send invite");
      },
    }),
  );

  const handleSubmit = (data: InviteFormType) => {
    if (!feed) return;

    inviteMutation.mutate({
      id: feed.id,
      email: data.email?.trim() ?? undefined,
      phone_number: data.phone_number?.trim() ?? undefined,
      name: data.name?.trim() ?? undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <Form {...inviteForm}>
          <form
            className="space-y-4"
            onSubmit={inviteForm.handleSubmit(handleSubmit)}
          >
            <DialogHeader>
              <DialogTitle>Invite to Private Feed</DialogTitle>
              <DialogDescription>
                Invite someone to join &quot;{feed?.title}&quot; by email or
                phone number.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <FormField
                control={inviteForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Doe" />
                    </FormControl>
                    <FormDescription>
                      Optional name for the invite.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={inviteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="user@example.com"
                      />
                    </FormControl>
                    <FormDescription>
                      Email address to send the invite to.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              <FormField
                control={inviteForm.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" placeholder="+1234567890" />
                    </FormControl>
                    <FormDescription>
                      Phone number to send the invite to.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={inviteMutation.isPending}
              >
                {inviteMutation.isPending ? "Sending..." : "Send Invite"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
