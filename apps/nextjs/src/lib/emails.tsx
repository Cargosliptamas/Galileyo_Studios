import { render } from "@react-email/components";
import nodemailer from "nodemailer";

import { SendMagicLinkEmail } from "@galileyo/emails/emails/send-magic-link";

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
  const transporter = nodemailer.createTransport({
    host: "localhost",
    port: 1026,
    secure: false,
    // auth: {
    //   user: 'my_user',
    //   pass: 'my_password',
    // },
  });

  const emailHtml = await render(<SendMagicLinkEmail url={url} />);

  const options = {
    from: "you@example.com",
    to,
    subject: "Your login code for Galileo",
    html: emailHtml,
  };

  await transporter.sendMail(options);
}
