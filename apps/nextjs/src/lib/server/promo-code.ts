import { format, subDays } from "date-fns";
import type {
  service as serviceSchema,
  user as userSchema,
} from "@galileyo/db/schema";
import { and, eq, gte, lte } from "@galileyo/db";
import { db } from "@galileyo/db/client";
import {
  promocode as promocodeTable,
  subscription as subscriptionSchema,
} from "@galileyo/db/schema";

import type { ProfileInfo } from "./profile";
import { getProfileInfoBySubscription } from "./profile";

export interface InfluencerPromoCodeData {
  promoCode: {
    id: number;
    type: number;
    text: string;
    discount: number;
    isActive: number;
    activeFrom: string;
    activeTo: string;
    trialPeriod: number | null;
    showOnFrontend: number;
    description: string | null;
    idInfluencer: number | null;
    serviceId: number | null;
  };
  influencer: typeof userSchema.$inferSelect;
  service: typeof serviceSchema.$inferSelect | null;
  influencerInfo: ProfileInfo;
  subscription: typeof subscriptionSchema.$inferSelect;
  subscriptions: (typeof subscriptionSchema.$inferSelect)[];
}

export async function getInfluencerPromoCode(
  code: string,
): Promise<InfluencerPromoCodeData | null> {
  const now = format(new Date(),"yyyy-MM-dd 00:00:00");
  const yesterday = format(subDays(new Date(), 1),"yyyy-MM-dd 23:59:59");

  console.log("now", now);
  console.log("yesterday", yesterday);

  const promoCode = await db.query.promocode.findFirst({
    where: and(
      eq(promocodeTable.text, code),
      eq(promocodeTable.type, 5),
      eq(promocodeTable.isActive, 1),
      lte(promocodeTable.activeFrom, now),
      gte(promocodeTable.activeTo, now),
    ),
    with: {
      influencer: true,
      service: true,
    },
  });

  if (!promoCode) {
    console.error("Promo code not found");
    return null;
  }

  const { influencer: rawInfluencer, service: rawService, ...rest } = promoCode;

  if (!rawInfluencer || Array.isArray(rawInfluencer)) {
    console.error("Influencer not found");
    return null;
  }

  const influencer = rawInfluencer as typeof userSchema.$inferSelect;
  const service = (
    rawService && !Array.isArray(rawService) ? rawService : null
  ) as typeof serviceSchema.$inferSelect | null;

  const subscriptions = await db.query.subscription.findMany({
    where: eq(subscriptionSchema.idInfluencer, influencer.id),
  });

  const subscription = subscriptions[0];
  if (!subscription) {
    console.error("Subscription not found");
    return null;
  }

  const influencerInfo = await getProfileInfoBySubscription(
    subscription.id.toString(),
  );

  if (!influencerInfo) {
    console.error("Influencer info not found");
    return null;
  }

  return {
    promoCode: rest,
    influencer,
    service,
    influencerInfo,
    subscription,
    subscriptions,
  };
}
