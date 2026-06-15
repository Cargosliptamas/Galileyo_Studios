import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";

import { Button } from "@galileyo/ui/button";

import { StudiosPartnershipCta } from "~/components/studios/studios-partnership-cta";
import { StudiosThankYouEffects } from "~/components/studios/studios-thank-you-effects";
import { getStripe } from "~/lib/studios/stripe";

export const metadata: Metadata = {
  title: "Thank You",
  robots: { index: false },
};

interface SearchParams {
  session_id?: string;
}

interface Confirmation {
  heading: string;
  body: string;
  cta: { href: string; label: string } | null;
}

function confirmationFor(
  kind: string | undefined,
  episodeSlug: string | undefined,
): Confirmation {
  switch (kind) {
    case "donation":
      return {
        heading: "Thank you for funding independent film.",
        body: "Your donation keeps Episode 1 free and brings the next six to life. You just became part of how this gets made.",
        cta: { href: "/studios", label: "Back to Studios" },
      };
    case "episode":
      return {
        heading: "Unlocked. Enjoy the episode.",
        body: "Your access is ready. Press play whenever you are.",
        cta: episodeSlug
          ? { href: `/studios/watch/${episodeSlug}`, label: "Watch Now" }
          : { href: "/studios/episodes", label: "Browse Episodes" },
      };
    case "bronze":
      return {
        heading: "Welcome to the season.",
        body: "Bronze All-Access is active. Every released episode is yours for the year.",
        cta: { href: "/studios/episodes", label: "Start Watching" },
      };
    case "ad_free":
      return {
        heading: "Ad-free, on.",
        body: "Thanks for supporting the films. Your viewing is now commercial-free.",
        cta: { href: "/studios/episodes", label: "Back to Episodes" },
      };
    default:
      return {
        heading: "Thank you.",
        body: "Your purchase is confirmed. Welcome to Galileyo Studios.",
        cta: { href: "/studios", label: "Back to Studios" },
      };
  }
}

export default async function StudiosThankYouPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { session_id: sessionId } = await searchParams;
  const stripe = getStripe();

  let paid = false;
  let kind: string | undefined;
  let episodeSlug: string | undefined;

  if (stripe && sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      paid = session.payment_status === "paid" || session.status === "complete";
      kind = session.metadata?.studiosKind;
      episodeSlug = session.metadata?.episodeSlug;
    } catch (error) {
      console.error("[studios] Thank-you session lookup failed:", error);
    }
  }

  const confirmation = confirmationFor(kind, episodeSlug);

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-24 text-center md:px-8 md:py-32">
      {sessionId ? (
        <StudiosThankYouEffects sessionId={sessionId} paid={paid} />
      ) : null}

      {paid ? (
        <>
          <CheckCircle2
            className="mx-auto size-12 text-[rgb(var(--studios-accent))]"
            aria-hidden
          />
          <h1 className="font-display mt-6 text-[clamp(2rem,7vw,3rem)] leading-[1.05] text-[rgb(var(--studios-text))] md:text-5xl">
            {confirmation.heading}
          </h1>
          <p className="font-editorial mx-auto mt-5 max-w-lg text-base text-[rgb(var(--studios-text-muted))] md:text-lg">
            {confirmation.body}
          </p>
          {confirmation.cta ? (
            <Button
              asChild
              size="lg"
              className="font-display mt-8 h-12 w-full rounded-full bg-[rgb(var(--studios-accent))] text-xs uppercase tracking-[0.25em] text-[rgb(var(--studios-bg))] hover:bg-[rgb(var(--studios-accent-hi))] sm:w-auto sm:min-w-[14rem]"
            >
              <Link href={confirmation.cta.href}>{confirmation.cta.label}</Link>
            </Button>
          ) : null}
        </>
      ) : (
        <>
          <Clock
            className="mx-auto size-12 text-[rgb(var(--studios-text-muted))]"
            aria-hidden
          />
          <h1 className="font-display mt-6 text-[clamp(2rem,7vw,3rem)] leading-[1.05] text-[rgb(var(--studios-text))] md:text-5xl">
            Payment processing.
          </h1>
          <p className="font-editorial mx-auto mt-5 max-w-lg text-base text-[rgb(var(--studios-text-muted))] md:text-lg">
            Hang tight, this page will update on its own in a moment. If it does
            not, refresh and your confirmation will appear.
          </p>
        </>
      )}

      <StudiosPartnershipCta variant="compact" className="mt-12" />
    </div>
  );
}
