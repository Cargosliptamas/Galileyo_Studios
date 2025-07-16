import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface SendMagicLinkEmailProps {
  url?: string;
}

export const SendMagicLinkEmail = ({ url }: SendMagicLinkEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Your login code for Linear</Preview>
      <Container style={container}>
        <Img
          src={`https://galileyo.com/assets/f79669c4/img/logo-galileyo.png`}
          // width="100"
          // height="100"
          alt="Galileyo"
          style={logo}
        />
        <Heading style={heading}>Your login link for Galileyo</Heading>
        <Section style={buttonContainer}>
          <Button style={button} href={url}>
            Login to Galileyo
          </Button>
        </Section>
        <Text style={paragraph}>
          This link will only be valid for the next 5 minutes. If the button
          does not work, you can copy and paste the link directly into your
          browser.
        </Text>
        <Text style={paragraph}>{url}</Text>
        <Text style={paragraph}>
          If you did not request this login link, you can ignore this email.
        </Text>
        <Text style={paragraph}>
          If you have any questions, please contact us at{" "}
          <Link href="mailto:support@galileyo.com">support@galileyo.com</Link>.
        </Text>
        <Hr style={hr} />
        <Link href="http://localhost:3000" style={reportLink}>
          Galileyo
        </Link>
      </Container>
    </Body>
  </Html>
);

SendMagicLinkEmail.PreviewProps = {
  validationCode: "tt226-5398x",
} as SendMagicLinkEmailProps;

export default SendMagicLinkEmail;

const logo = {
  borderRadius: 21,
  width: 42,
  height: 42,
};

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "400",
  color: "#484848",
  padding: "17px 0 0",
};

const paragraph = {
  margin: "0 0 15px",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
};

const buttonContainer = {
  padding: "27px 0 27px",
};

const button = {
  backgroundColor: "#5e6ad2",
  borderRadius: "3px",
  fontWeight: "600",
  color: "#fff",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "11px 23px",
};

const reportLink = {
  fontSize: "14px",
  color: "#b4becc",
};

const hr = {
  borderColor: "#dfe1e4",
  margin: "42px 0 26px",
};

// const code = {
//   fontFamily: 'monospace',
//   fontWeight: '700',
//   padding: '1px 4px',
//   backgroundColor: '#dfe1e4',
//   letterSpacing: '-0.3px',
//   fontSize: '21px',
//   borderRadius: '4px',
//   color: '#3c4149',
// };
