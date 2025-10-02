"use client";

import type { User } from "~/auth/client";
import { getUserImageUrl } from "./image";

export const getProfilePicture = (user: User) => {
  if (!user.image) {
    return null;
  }

  return getUserImageUrl(user.image);
};
