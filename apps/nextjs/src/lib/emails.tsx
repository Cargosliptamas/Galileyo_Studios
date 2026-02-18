import { render } from "@react-email/components";

import { sendEmail as sendEmailFunction } from "@galileyo/emails";
import { SendMagicLinkEmail } from "@galileyo/emails/templates";

// import { WelcomeEmail } from "@galileyo/emails/emails/welcome";
// import { PasswordResetEmail } from "@galileyo/emails/emails/password-reset";

// import { env } from "~/env";

export interface SendEmailProps<T extends React.ReactNode> {
  to: string;
  subject: string;
  email: T;
}

export async function sendEmail<T extends React.ReactNode>({
  to,
  subject,
  email,
}: SendEmailProps<T>) {
  const emailHtml = await render(email);

  await sendEmailFunction({
    to,
    subject,
    html: emailHtml,
  });
}

export async function sendMagicLinkEmail({
  to,
  // token,
  url,
}: {
  to: string;
  token: string;
  url: string;
}) {
  // const config: Record<string, any> = {
  //   host: env.EMAIL_HOST,
  //   port: env.EMAIL_PORT,
  //   secure: false,
  //   auth: undefined,
  // };

  // if (env.EMAIL_USER && env.EMAIL_PASSWORD) {
  //   config.auth = {
  //     user: env.EMAIL_USER,
  //     pass: env.EMAIL_PASSWORD,
  //   };
  // }

  // const transporter = nodemailer.createTransport(config);

  // const emailHtml = await render(<SendMagicLinkEmail url={url} />);

  // const options = {
  //   from: env.EMAIL_FROM,
  //   to,
  //   subject: "Sign in to Galileyo",
  //   html: emailHtml,
  // };

  // await transporter.sendMail(options);

  await sendEmail({
    to,
    subject: "Sign in to your Galileyo account",
    email: <SendMagicLinkEmail url={url} />,
  });
}
