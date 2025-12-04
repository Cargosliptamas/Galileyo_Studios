"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui";
import { Badge } from "@galileyo/ui/badge";
import { Button } from "@galileyo/ui/button";

interface DeleteMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    type: "member" | "template";
    id: number;
    name: string;
  } | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteMemberDialog({
  isOpen,
  onOpenChange,
  item,
  onConfirm,
  isDeleting,
}: DeleteMemberDialogProps) {
  if (!item) return null;

  const isTemplate = item.type === "template";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Delete {isTemplate ? "Invitation" : "Member"}
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <Badge variant="outline">{item.name}</Badge>? This action cannot be
          undone.
          {isTemplate
            ? " The pending invitation will be removed."
            : " The member will be removed from your account."}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
