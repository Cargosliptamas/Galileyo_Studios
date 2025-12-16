import { HomePageV2 as HomePageComponent } from "~/components/public-site/home-page-v2";
import { HydrateClient } from "~/trpc/server";

export default function HomePage() {
  return (
    <HydrateClient>
      <HomePageComponent />
    </HydrateClient>
  );
}
