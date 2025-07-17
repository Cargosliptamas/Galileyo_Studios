import {
  HydrateClient,
} from "~/trpc/server";
import ContactPageComponent from "~/components/public-site/contact-us";

export default function ContactPage() {
  return (
    <HydrateClient>
      {/* <main className="container"> */}
        <ContactPageComponent />
      {/* </main> */}
    </HydrateClient>
  );
}
