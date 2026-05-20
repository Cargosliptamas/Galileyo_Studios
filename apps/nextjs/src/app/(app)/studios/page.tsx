import { StudiosEmailGate } from "~/components/studios/studios-email-gate";
import { StudiosEpisodeRoadmap } from "~/components/studios/studios-episode-roadmap";
import { StudiosHero } from "~/components/studios/studios-hero";
import { StudiosSeriesIntro } from "~/components/studios/studios-series-intro";

export default function StudiosLandingPage() {
  return (
    <>
      <StudiosHero />
      <StudiosEmailGate />
      <StudiosSeriesIntro />
      <StudiosEpisodeRoadmap />
    </>
  );
}
