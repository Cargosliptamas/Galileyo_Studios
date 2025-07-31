import HomePageComponent from "~/components/public-site/home";
import { HydrateClient } from "~/trpc/server";

export default function HomePage() {
  return (
    <HydrateClient>
      <HomePageComponent />
    </HydrateClient>
  );
}
