import ContactPageComponent from "~/components/public-site/contact-us";
import { HydrateClient } from "~/trpc/server";

export default function ContactPage() {
  return (
    <HydrateClient>
      {/* <main className="container"> */}
      <ContactPageComponent />
      {/* </main> */}
    </HydrateClient>
  );
}
