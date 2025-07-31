import { createContext, useContext } from "react";

import type { FeedItem } from "@galileyo/api/schemas";

export interface CommentsModalContextType {
  handleOpenCommentsModal: (post: FeedItem) => void;
}

export const CommentsModalContext = createContext<CommentsModalContextType>(
  null as unknown as CommentsModalContextType,
);

export function useCommentsModal() {
  const context = useContext(CommentsModalContext);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!context) {
    throw new Error(
      "useCommentsModal must be used within a CommentsModalContext",
    );
  }

  const openModal = (post: FeedItem) => {
    // setIsOpen(true, post);
    context.handleOpenCommentsModal(post);
  };

  return {
    openModal,
  };
}
