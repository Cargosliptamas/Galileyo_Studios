"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@galileyo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@galileyo/ui/dialog";
import { Label } from "@galileyo/ui/label";
import { RadioGroup, RadioGroupItem } from "@galileyo/ui/radio-group";
import { Textarea } from "@galileyo/ui/textarea";
import { toast } from "@galileyo/ui/toast";

import { useReportModal } from "~/hooks/use-report-modal";
import { useTRPC } from "~/trpc/react";

const reportReasons = [
  { value: "spam", label: "Spam or misleading content" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "hate_speech", label: "Hate speech or discrimination" },
  { value: "violence", label: "Violence or dangerous content" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "copyright", label: "Copyright infringement" },
  { value: "fake_news", label: "False information" },
  { value: "other", label: "Other" },
];

export default function ReportModal() {
  const { isOpen, post, close } = useReportModal();
  const trpc = useTRPC();
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [additionalText, setAdditionalText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportMutation = useMutation(
    trpc.feed.reportPost.mutationOptions({
      onSuccess: () => {
        toast.success("Report submitted successfully");
        close();
        setSelectedReason("");
        setAdditionalText("");
      },
      onError: (error) => {
        console.error("Failed to submit report:", error);
        toast.error("Failed to submit report. Please try again.");
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    }),
  );

  const handleSubmit = () => {
    if (!selectedReason || !post) {
      toast.error("Please select a reason for reporting");
      return;
    }

    setIsSubmitting(true);

    reportMutation.mutate({
      postId: String(post.id),
      reason: selectedReason,
      additionalText: additionalText.trim() || undefined,
    });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      close();
      setSelectedReason("");
      setAdditionalText("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Post</DialogTitle>
          <DialogDescription>
            Help us keep the community safe by reporting content that violates
            our guidelines.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Why are you reporting this post?
            </Label>
            <RadioGroup
              value={selectedReason}
              onValueChange={setSelectedReason}
              className="space-y-2"
            >
              {reportReasons.map((reason) => (
                <div key={reason.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.value} id={reason.value} />
                  <Label
                    htmlFor={reason.value}
                    className="cursor-pointer text-sm font-normal"
                  >
                    {reason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional-text" className="text-sm font-medium">
              Additional details (optional)
            </Label>
            <Textarea
              id="additional-text"
              placeholder="Please provide any additional context that might help us understand the issue..."
              value={additionalText}
              onChange={(e) => setAdditionalText(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
            <div className="text-right text-xs text-muted-foreground">
              {additionalText.length}/500
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
