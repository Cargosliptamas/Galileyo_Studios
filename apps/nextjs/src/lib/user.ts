"use client";

import type { User } from "~/auth/client";
import { env } from "~/env";

export const getProfilePicture = (user: User) => {
  if (!user.image) {
    return null;
  }

  return env.NEXT_PUBLIC_API_URL.replace("/v1", "/uploads/user/") + user.image;
};
