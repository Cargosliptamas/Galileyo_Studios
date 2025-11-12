import { HomePage as HomePageComponent } from "~/components/public-site/home-page";
import { HydrateClient } from "~/trpc/server";

export default function HomePage() {
  return (
    <HydrateClient>
      <HomePageComponent />
    </HydrateClient>
  );
}
