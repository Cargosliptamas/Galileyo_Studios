"use server";

import webpush from "web-push";

import { getSession } from "~/auth/server";
import { env } from "~/env";
import { VisibleError } from "~/lib/visible-error";

webpush.setVapidDetails(
  "mailto:info@galileyo.com",
  env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY,
);

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
  // 0x4AAAAAAB0QoqBu_2OtubrO8Y1mCaPXWB4

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
