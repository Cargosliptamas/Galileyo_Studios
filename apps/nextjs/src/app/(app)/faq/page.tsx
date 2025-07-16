import {
  HydrateClient,
} from "~/trpc/server";
import FAQPageComponent from "~/components/public-site/faq";

export default function FAQPage() {
  return (
    <HydrateClient>
      <main className="container">
        <FAQPageComponent />
      </main>
    </HydrateClient>
  );
}
