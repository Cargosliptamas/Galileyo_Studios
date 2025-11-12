import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import { LogoSection } from "./common/logo-section";

interface PasswordResetEmailProps {
  url?: string;
  name?: string;
}

export const PasswordResetEmail = ({ url, name }: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Reset your Galileyo password</Preview>
      <Container style={container}>
        <LogoSection />

        <Section style={content}>
          <Heading style={heading}>Reset your password</Heading>
          <Text style={paragraph}>{name ? `Hi ${name},` : "Hi,"}</Text>
          <Text style={paragraph}>
            We received a request to reset your password. Click the button below
            to create a new password. This link will expire in 5 minutes for
            your security.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={url}>
              Reset password
            </Button>
          </Section>

          <Section style={linkContainer}>
            <Text style={linkText}>
              Or copy and paste this link into your browser:
            </Text>
            <Link href={url} style={link}>
              {url}
            </Link>
          </Section>
        </Section>

        <Hr style={hr} />

        <Section style={footer}>
          <Text style={footerText}>
            If you didn't request a password reset, you can safely ignore this
            email. Your password will remain unchanged.
          </Text>
          <Text style={footerText}>
            For security reasons, never share this link with anyone. If you have
            concerns about your account security, please contact us immediately.
          </Text>
          <Text style={footerText}>
            Need help? Contact us at{" "}
            <Link href="mailto:support@galileyo.com" style={footerLink}>
              support@galileyo.com
            </Link>
          </Text>
          <Text style={footerCopyright}>
            © {new Date().getFullYear()} Galileyo. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

PasswordResetEmail.PreviewProps = {
  url: "https://galileyo.com/auth/reset-password?token=abc123xyz789",
  name: "Alex",
} as PasswordResetEmailProps;

export default PasswordResetEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  marginBottom: "64px",
  maxWidth: "600px",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
};

const content = {
  padding: "40px 40px 32px",
};

const heading = {
  fontSize: "28px",
  letterSpacing: "-0.5px",
  lineHeight: "1.2",
  fontWeight: "600",
  color: "#111827",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const paragraph = {
  margin: "0 0 24px",
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#4b5563",
  textAlign: "left" as const,
};

const buttonContainer = {
  padding: "32px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#5e6ad2",
  borderRadius: "6px",
  fontWeight: "600",
  color: "#ffffff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
  boxShadow: "0 2px 4px rgba(94, 106, 210, 0.2)",
};

const linkContainer = {
  padding: "24px 0",
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
  margin: "0",
};

const linkText = {
  margin: "0 0 8px",
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#6b7280",
  textAlign: "center" as const,
  padding: "0 20px",
};

const link = {
  fontSize: "13px",
  lineHeight: "1.5",
  color: "#5e6ad2",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
  textAlign: "center" as const,
  display: "block",
  padding: "0 20px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "0",
  borderWidth: "1px 0 0",
};

const footer = {
  padding: "32px 40px",
  backgroundColor: "#f9fafb",
  borderBottomLeftRadius: "8px",
  borderBottomRightRadius: "8px",
};

const footerText = {
  margin: "0 0 12px",
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#6b7280",
  textAlign: "center" as const,
};

const footerLink = {
  color: "#5e6ad2",
  textDecoration: "underline",
};

const footerCopyright = {
  margin: "24px 0 0",
  fontSize: "12px",
  lineHeight: "1.5",
  color: "#9ca3af",
  textAlign: "center" as const,
};
