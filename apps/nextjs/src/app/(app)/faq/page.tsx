import FAQPageComponent from "~/components/public-site/faq";
import { HydrateClient } from "~/trpc/server";

export default function FAQPage() {
  return (
    <HydrateClient>
      {/* <main className="container"> */}
      <FAQPageComponent />
      {/* </main> */}
    </HydrateClient>
  );
}
