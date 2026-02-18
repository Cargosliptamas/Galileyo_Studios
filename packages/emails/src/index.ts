import nodemailer from "nodemailer";
import { Resend } from "resend";

import { env } from "./env";

let resendClient: Resend | null = null;
let nodemailerTransport: nodemailer.Transporter | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NodemailerConfig = Record<string, any>;

export interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
  transport?: "nodemailer" | "resend";
}

function getResendClient() {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }

  return resendClient;
}

function getNodemailerTransport() {
  if (nodemailerTransport) {
    return nodemailerTransport;
  }

  const config: NodemailerConfig = {
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

  nodemailerTransport = nodemailer.createTransport(config);

  return nodemailerTransport;
}

async function sendEmailWithNodemailer({ to, subject, html }: SendEmailProps) {
  const transporter = getNodemailerTransport();

  const options = {
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
  };

  await transporter.sendMail(options);
}

async function sendEmailWithResend({ to, subject, html }: SendEmailProps) {
  const { data, error } = await getResendClient().emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Failed to send email with Resend: ${error.message}`);
  }

  return data;
}

export async function sendEmail({
  to,
  subject,
  html,
  transport,
}: SendEmailProps) {
  const resendApiKey = env.RESEND_API_KEY;

  const sendFunction: SendEmailProps["transport"] =
    transport ?? (resendApiKey ? "resend" : "nodemailer");

  switch (sendFunction) {
    case "nodemailer":
      await sendEmailWithNodemailer({ to, subject, html });
      break;
    case "resend":
      await sendEmailWithResend({ to, subject, html });
      break;
  }
}
