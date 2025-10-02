"use server";

import type { phoneNumber as phoneNumberSchema } from "@galileyo/db/schema";
import { and, eq } from "@galileyo/db";
import { db } from "@galileyo/db/client";
import {
  follower,
  followerList,
  influencerPage as influencerPageSchema,
  subscription as subscriptionSchema,
  user,
  userSubscription,
} from "@galileyo/db/schema";

import { COUNTRIES, US_STATES } from "~/constants/country";

export interface ProfileInfo {
  type: "followerList" | "subscription";
  id: number;
  name: string | null;
  title: string | null;
  isPublic: boolean;
  pageDescription: string | null;
  shortPageFormat: boolean;
  alias: string | null;
  isSubscribed: boolean;
  image: string | null;
}

export async function getProfileInfoBySubscription(
  id: string,
  userId?: string,
): Promise<ProfileInfo | null> {
  const data = await db.query.subscription.findFirst({
    where: eq(subscriptionSchema.id, Number(id)),
    with: {
      influencerPages: true,
    },
  });

  if (!data) {
    return null;
  }

  let isSubscribed = false;

  if (userId) {
    const response = await db.query.userSubscription.findFirst({
      columns: {
        idSubscription: true,
      },
      where: and(
        eq(userSubscription.idUser, Number(userId)),
        eq(userSubscription.idSubscription, Number(id)),
      ),
    });

    isSubscribed = !!response;
  }

  const influencerPage = data.influencerPages[0] as
    | typeof influencerPageSchema.$inferSelect
    | null;

  return {
    id: data.id,
    type: "subscription",
    name: data.name,
    title: influencerPage?.title ?? data.title,
    isPublic: Boolean(data.isPublic),
    pageDescription: influencerPage?.description ?? data.description,
    shortPageFormat: data.influencerPages.length === 0,
    alias: influencerPage?.alias ?? null,
    isSubscribed,
    image: influencerPage?.image ?? null,
  };
}

export async function getProfileInfoByAlias(
  alias: string,
  userId?: string,
): Promise<ProfileInfo | null> {
  const data = await db.query.influencerPage.findFirst({
    where: eq(influencerPageSchema.alias, alias),
    with: {
      subscription: true,
    },
  });

  if (!data) {
    return null;
  }

  const subscription =
    data.subscription as typeof subscriptionSchema.$inferSelect;
  let isSubscribed = false;

  if (userId) {
    const response = await db.query.userSubscription.findFirst({
      columns: {
        idSubscription: true,
      },
      where: and(
        eq(userSubscription.idUser, Number(userId)),
        eq(userSubscription.idSubscription, Number(subscription.id)),
      ),
    });

    isSubscribed = !!response;
  }

  return {
    type: "subscription",
    id: subscription.id,
    name: data.title,
    title: subscription.title ?? data.title,
    isPublic: Boolean(subscription.isPublic),
    pageDescription: data.description,
    shortPageFormat: false,
    alias: data.alias,
    isSubscribed,
    image: data.image,
  };
}

export async function getProfileInfoByFollowerList(
  id: string,
  userId?: string,
): Promise<ProfileInfo | null> {
  const data = await db.query.followerList.findFirst({
    where: eq(followerList.id, Number(id)),
  });

  if (!data) {
    return null;
  }

  let isSubscribed = false;

  if (userId) {
    const response = await db.query.follower.findFirst({
      columns: {
        idFollowerList: true,
      },
      where: and(
        eq(follower.idUserFollower, Number(userId)),
        eq(follower.idFollowerList, data.id),
      ),
    });

    isSubscribed = !!response;
  }

  return {
    type: "followerList",
    id: data.id,
    name: data.name,
    title: null,
    isPublic: false,
    pageDescription: data.description,
    shortPageFormat: false,
    alias: null,
    isSubscribed,
    image: data.image,
  };
}

export async function getUserProfile(id: number, authenticatedUser?: string) {
  const authenticatedUserId = authenticatedUser
    ? Number(authenticatedUser)
    : null;

  const data = await db.query.user.findFirst({
    where: eq(user.id, id),
    with: {
      userFriends_idFriend: true,
      phoneNumbers: true,
    },
  });

  if (!data) {
    return null;
  }

  const isDeleted = data.status === 3;

  const isFriend = data.userFriends_idFriend.some(
    (friend) => friend.idFriend === authenticatedUserId,
  );
  const ownProfile = id === authenticatedUserId;

  const isPhoneVisible =
    ownProfile ||
    data.phoneVisibility === 0 ||
    (data.phoneVisibility === 1 && isFriend);
  const isAddressVisible =
    ownProfile ||
    data.addressVisibility === 0 ||
    (data.addressVisibility === 1 && isFriend);

  let address: string | null = null;
  let phone: string | null = null;

  if (isAddressVisible) {
    let str = "";
    if (data.state && data.state !== "") {
      const state = US_STATES.find((state) => state.code === data.state);
      str += state?.name ?? "";
      str += ", ";
    }
    if (data.country && data.country !== "") {
      const country = COUNTRIES.find(
        (country) => country.code === data.country,
      );
      str += country?.name ?? "";
    }

    address = str;
  }

  if (isPhoneVisible) {
    const phoneNumbers = data.phoneNumbers.filter(
      (phone) => phone.isPrimary === 1 && phone.isActive === 1,
    ) as (typeof phoneNumberSchema.$inferSelect)[];

    phone = phoneNumbers[0]?.number ?? null;
  }

  return {
    id: data.id,
    name: isDeleted ? "Deleted User" : `${data.firstName} ${data.lastName}`,
    image: data.image,
    headerImage: data.headerImage,
    about: data.about,
    phone,
    address,
    phoneVisible: isPhoneVisible,
    addressVisible: isAddressVisible,
  };
}
