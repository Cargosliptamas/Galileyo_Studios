import { PartnersPage as PartnersPageComponent } from "~/components/public-site/partners-page";
import { HydrateClient } from "~/trpc/server";

export default function PartnersPage() {
  return (
    <HydrateClient>
      <PartnersPageComponent />
    </HydrateClient>
  );
}
