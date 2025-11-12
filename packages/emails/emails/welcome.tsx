import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import { LogoSection } from "./common/logo-section";

interface WelcomeEmailProps {
  name?: string;
  loginUrl?: string;
}

export const WelcomeEmail = ({ name, loginUrl }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Welcome to Galileyo! Get started with your account.</Preview>
      <Container style={container}>
        <LogoSection />

        <Section style={content}>
          <Heading style={heading}>Welcome to Galileyo! 🎉</Heading>
          <Text style={paragraph}>{name ? `Hi ${name},` : "Hi there,"}</Text>
          <Text style={paragraph}>
            We're thrilled to have you join the Galileyo community! Your account
            has been successfully created and you're all set to get started.
          </Text>

          {loginUrl && (
            <>
              <Section style={buttonContainer}>
                <Button style={button} href={loginUrl}>
                  Get started
                </Button>
              </Section>
            </>
          )}

          <Section style={featuresContainer}>
            <Text style={featuresHeading}>Here's what you can do:</Text>
            <Text style={featureItem}>
              • Receive real-time alerts about emergencies and critical events
            </Text>
            <Text style={featureItem}>
              • Access information via satellite, even when networks fail
            </Text>
            <Text style={featureItem}>
              • Connect with friends, family, and community through secure
              messaging
            </Text>
            <Text style={featureItem}>
              • View interactive alert maps with real-time emergency information
            </Text>
            <Text style={featureItem}>
              • Follow influencers and access uncensored content
            </Text>
          </Section>

          <Text style={paragraph}>
            Thank you for choosing Galileyo. We're glad you're here and look
            forward to being part of your journey!
          </Text>
        </Section>

        <Hr style={hr} />

        <Section style={footer}>
          <Text style={footerCopyright}>
            © {new Date().getFullYear()} Galileyo. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

WelcomeEmail.PreviewProps = {
  name: "Alex",
  loginUrl: "https://galileyo.com/dashboard",
} as WelcomeEmailProps;

export default WelcomeEmail;

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

const featuresContainer = {
  padding: "24px",
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
  margin: "32px 0",
};

const featuresHeading = {
  margin: "0 0 16px",
  fontSize: "18px",
  fontWeight: "600",
  color: "#111827",
  textAlign: "left" as const,
};

const featureItem = {
  margin: "0 0 12px",
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#4b5563",
  textAlign: "left" as const,
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

const footerCopyright = {
  margin: "24px 0 0",
  fontSize: "12px",
  lineHeight: "1.5",
  color: "#9ca3af",
  textAlign: "center" as const,
};
