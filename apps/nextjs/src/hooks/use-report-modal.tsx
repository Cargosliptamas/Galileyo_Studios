"use client";

import { create } from "zustand";

import type { FeedItem } from "@galileyo/api/schemas";

interface ReportModalStore {
  isOpen: boolean;
  post: FeedItem | null;
  open: (post: FeedItem) => void;
  close: () => void;
}

export const useReportModal = create<ReportModalStore>((set) => ({
  isOpen: false,
  post: null,
  open: (post: FeedItem) => set({ isOpen: true, post }),
  close: () => set({ isOpen: false, post: null }),
}));
