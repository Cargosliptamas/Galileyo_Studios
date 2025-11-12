import { Img, Section } from "@react-email/components";

import { getBaseUrl } from "@galileyo/utils";

const logo = {
  borderRadius: "8px",
  width: "auto",
  height: "128px",
  margin: "0 auto",
};

const logoSection = {
  padding: "32px 40px 24px",
  textAlign: "center" as const,
  borderBottom: "1px solid #e5e7eb",
  backgroundColor: "#1e293b",
};

export const LogoSection = () => (
  <Section style={logoSection}>
    <Img
      src={`${getBaseUrl()}/galileyo_new_logo.png`}
      alt="Galileyo"
      style={logo}
    />
  </Section>
);
