"use client";

import { CommentsModalContext } from "~/hooks/use-comments-modal";
import { FeatureShowcaseExperience } from "./feature-showcase-experience";

export function FeatureShowcasePage() {
  return (
    <CommentsModalContext.Provider
      value={{
        handleOpenCommentsModal: () => {
          // Showcase mode keeps production feed visuals inert.
        },
      }}
    >
      <FeatureShowcaseExperience />
    </CommentsModalContext.Provider>
  );
}
