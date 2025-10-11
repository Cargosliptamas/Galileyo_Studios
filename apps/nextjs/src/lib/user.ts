"use client";

import type { User } from "~/auth/client";
import { getUserImageUrl } from "./image";

export type UserStatus = 0 | 1 | 2 | 3 | 4;
export type UserStatusTypes =
  | "unknown"
  | "active"
  | "cancelled"
  | "deleted"
  | "to_verify";

export const UserStatusMap = {
  0: "unknown",
  1: "active",
  2: "cancelled",
  3: "deleted",
  4: "to_verify",
} as const;

export const getUserStatus = (status: number): UserStatusTypes => {
  const exists = Object.keys(UserStatusMap).includes(status.toString());

  if (!exists) {
    return "unknown";
  }

  return UserStatusMap[status as UserStatus];
};

export const getUserStatusLabel = (status: number): string => {
  const userStatus = getUserStatus(status);

  switch (userStatus) {
    case "active":
      return "Active";
    case "cancelled":
      return "Cancelled";
    case "deleted":
      return "Deleted";
    case "to_verify":
      return "To Verify";
    default:
      return "Unknown";
  }
};

export const getProfilePicture = (user: User) => {
  if (!user.image) {
    return null;
  }

  return getUserImageUrl(user.image);
};
