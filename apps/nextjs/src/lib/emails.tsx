import { render } from "@react-email/components";
import nodemailer from "nodemailer";

import { SendMagicLinkEmail } from "@galileyo/emails/emails/send-magic-link";

import { env } from "~/env";

// import { env } from '~/env';

// const baseUrl = env.VERCEL_URL
//   ? `https://${env.VERCEL_URL}`
//   : '';

export async function sendMagicLinkEmail({
  to,
  // token,
  url,
}: {
  to: string;
  token: string;
  url: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config: Record<string, any> = {
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: false,
    auth: undefined,
  };

  if (env.EMAIL_USER && env.EMAIL_PASSWORD) {
    config.auth = {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD,
    };
  }

  const transporter = nodemailer.createTransport(config);

  const emailHtml = await render(<SendMagicLinkEmail url={url} />);

  const options = {
    from: env.EMAIL_FROM,
    to,
    subject: "Sign in to Galileo",
    html: emailHtml,
  };

  await transporter.sendMail(options);
}
