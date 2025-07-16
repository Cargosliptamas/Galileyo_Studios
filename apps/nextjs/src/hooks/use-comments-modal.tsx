import type { FeedItem } from "@galileyo/api";
import { createContext, useContext } from "react";

export interface CommentsModalContextType {
  handleOpenCommentsModal: (post: FeedItem) => void;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const CommentsModalContext = createContext<CommentsModalContextType>(null!);

export function useCommentsModal() {
  const context = useContext(CommentsModalContext);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!context) {
    throw new Error('useCommentsModal must be used within a CommentsModalContext');
  }

  const openModal = (post: FeedItem) => {
    // setIsOpen(true, post);
    console.log('openModal', post);
    context.handleOpenCommentsModal(post);
  };

  return {
    openModal
  };
}