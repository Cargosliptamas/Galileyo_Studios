import type { Metadata } from "next";

import { FeatureShowcasePage } from "~/components/public-site/feature-showcase-page";

export const metadata: Metadata = {
  title: "Feature Showcase | Galileyo",
  description:
    "Explore Galileyo's full-page feature showcase with real-time alerts, map awareness, on-the-ground video updates, and private feed coordination.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ShowcasePage() {
  return <FeatureShowcasePage />;
}
