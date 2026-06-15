"use server";

import { cookies } from "next/headers";
import { UTCDate } from "@date-fns/utc";
import { format } from "date-fns";
import webpush from "web-push";

import { db } from "@galileyo/db/client";
import { contact } from "@galileyo/db/schema";

import { getSession } from "~/auth/server";
import { env } from "~/env";
import { VisibleError } from "~/lib/visible-error";

// Only configure web-push when both VAPID keys are present. Calling
// setVapidDetails with a missing/empty key throws at module load, which would
// take down every route that imports this "use server" file. When the keys are
// absent we leave push notifications unconfigured and fail soft below.
const vapidConfigured = Boolean(
  env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY,
);

if (vapidConfigured) {
  webpush.setVapidDetails(
    "mailto:info@galileyo.com",
    env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY,
  );
}

let subscription: PushSubscription | null = null;

// eslint-disable-next-line @typescript-eslint/require-await
export async function subscribeUser(sub: PushSubscription) {
  subscription = sub;
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })
  return { success: true };
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function unsubscribeUser() {
  subscription = null;
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  return { success: true };
}

export async function sendNotification(message: string) {
  if (!vapidConfigured) {
    return { success: false, error: "Push notifications are not configured" };
  }
  if (!subscription) {
    throw new Error("No subscription available");
  }

  try {
    await webpush.sendNotification(
      subscription as unknown as webpush.PushSubscription,
      JSON.stringify({
        title: "Galileyo",
        body: message,
        icon: "/galileyo_new_logo.png",
      }),
    );
    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { success: false, error: "Failed to send notification" };
  }
}

export async function sendContactUsEmail(
  name: string,
  email: string,
  subject: string,
  message: string,
  turnstileToken: string,
): Promise<{ success: boolean; error: string | null }> {
  await db.insert(contact).values({
    name: name,
    email: email,
    subject: subject,
    body: message,
    status: 1,
    createdAt: format(new UTCDate(), "yyyy-MM-dd HH:mm:ss"),
  });
  console.log(
    "Sending contact us email",
    name,
    email,
    subject,
    message,
    turnstileToken,
  );

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { success: true, error: null };
}

export async function updateProfilePicture(form: FormData) {
  const session = await getSession();

  if (!session) {
    throw new Error("No session found");
  }

  const request = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/customer/update-avatar`,
    {
      method: "POST",
      headers: {
        // "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${session.session.token}`,
      },
      body: form,
    },
  );

  const result = (await request.json()) as {
    status: "success" | "error";
    data: {
      id: string;
      photo: string;
    };
    error: {
      message: string;
      code: string | number | null;
    };
  };

  if (result.status !== "success") {
    throw new VisibleError(result.error.message);
  }

  return result.data;
}

export async function updateHeaderPicture(form: FormData) {
  const session = await getSession();

  if (!session) {
    throw new Error("No session found");
  }

  const request = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/customer/update-header`,
    {
      method: "POST",
      headers: {
        // "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${session.session.token}`,
      },
      body: form,
    },
  );

  const result = (await request.json()) as {
    status: "success" | "error";
    data: {
      id: string;
      header: string;
    };
    error: {
      message: string;
      code: string | number | null;
    };
  };

  if (result.status !== "success") {
    throw new VisibleError(result.error.message);
  }

  return result.data;
}

export async function downloadInvoice(invoiceId: number) {
  const session = await getSession();
  if (!session) {
    throw new Error("No session found");
  }

  const request = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/product/download-invoice`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.session.token}`,
      },
      body: JSON.stringify({ invoice_id: invoiceId }),
    },
  );

  const statusCode = request.status;

  if (statusCode === 422) {
    throw new VisibleError("Validation error");
  }

  if (statusCode === 404) {
    throw new VisibleError("Invoice not found");
  }

  if (statusCode !== 200) {
    throw new VisibleError("Failed to download invoice");
  }

  const data = await request.blob();

  return data;
}

export async function removeAffiliateCookie() {
  const cookieStore = await cookies();

  cookieStore.delete("affiliate_token");

  return { success: true };
}

export async function setAffiliateCookie(affiliateToken: string) {
  const cookieStore = await cookies();

  cookieStore.set("affiliate_token", affiliateToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 10, // 10 days
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return { success: true };
}
