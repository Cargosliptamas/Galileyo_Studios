import { StudiosBronzeUpsell } from "~/components/studios/studios-bronze-upsell";
import { StudiosEmailGate } from "~/components/studios/studios-email-gate";
import { StudiosEpisodeRoadmap } from "~/components/studios/studios-episode-roadmap";
import { StudiosGameProducerCard } from "~/components/studios/studios-game-producer-card";
import { StudiosHero } from "~/components/studios/studios-hero";
import { StudiosProducerTiersPreview } from "~/components/studios/studios-producer-tiers-preview";
import { StudiosSeriesIntro } from "~/components/studios/studios-series-intro";
import { StudiosSponsorStrip } from "~/components/studios/studios-sponsor-strip";

export default function StudiosLandingPage() {
  return (
    <>
      <StudiosHero />
      <StudiosEmailGate />
      <StudiosSeriesIntro />
      <StudiosEpisodeRoadmap />
      <StudiosProducerTiersPreview />
      <StudiosGameProducerCard />
      <StudiosBronzeUpsell />
      <StudiosSponsorStrip />
    </>
  );
}
