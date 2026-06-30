import type { Metadata } from "next";

import { StudiosAboutStrip } from "~/components/studios/studios-about-strip";
import { StudiosAffiliateTeaser } from "~/components/studios/studios-affiliate-teaser";
import { StudiosBronzeUpsell } from "~/components/studios/studios-bronze-upsell";
import { StudiosDonateCard } from "~/components/studios/studios-donate-card";
import { StudiosEmailGate } from "~/components/studios/studios-email-gate";
import { StudiosEpisodeRoadmap } from "~/components/studios/studios-episode-roadmap";
import { StudiosGameProducerCard } from "~/components/studios/studios-game-producer-card";
import { StudiosHero } from "~/components/studios/studios-hero";
import { StudiosProducerTiersPreview } from "~/components/studios/studios-producer-tiers-preview";
import { StudiosSeriesIntro } from "~/components/studios/studios-series-intro";
import { StudiosSponsorStrip } from "~/components/studios/studios-sponsor-strip";
import { getPublishedEpisodes } from "~/lib/studios/episodes-db";
import { buildStudiosMetadata } from "~/lib/studios/metadata";

export const metadata: Metadata = buildStudiosMetadata({
  title: "Watch Episode 1 Free, an AI-Made Series",
  description:
    "An original AI-made film series from Galileyo Studios. Episode 1 is free to stream. Drop your email and watch now.",
  path: "/",
});

export default async function StudiosLandingPage() {
  const episodes = await getPublishedEpisodes();

  return (
    <>
      <StudiosHero />
      <StudiosEmailGate />
      <StudiosSeriesIntro />
      <StudiosEpisodeRoadmap episodes={episodes} />
      <StudiosProducerTiersPreview />
      <StudiosDonateCard />
      <StudiosGameProducerCard />
      <StudiosBronzeUpsell />
      <StudiosSponsorStrip />
      <StudiosAffiliateTeaser />
      <StudiosAboutStrip />
      <StudiosEmailGate
        variant="band"
        headline="Last chance. Episode 1, on us."
        description="Drop your email and we'll send the link before you close the tab."
      />
    </>
  );
}
