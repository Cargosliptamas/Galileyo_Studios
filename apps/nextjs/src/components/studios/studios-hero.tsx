import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

import { Button } from "@galileyo/ui/button";

import { env } from "~/env/client";
import { StudiosCountdown } from "./studios-countdown";

export function StudiosHero() {
  const trailerUrl = env.NEXT_PUBLIC_EPISODE_1_TRAILER_URL;
  const nextEpisodeDate = env.NEXT_PUBLIC_NEXT_EPISODE_DATE;

  return (
    <section className="studios-grain relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        {trailerUrl ? (
          <video
            src={trailerUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_top,rgba(200,160,74,0.18)_0%,transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(28,28,31,0.9)_0%,rgb(11,11,13)_60%)]" />
        )}
      </div>

      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(11,11,13,0.55)_0%,rgba(11,11,13,0.75)_60%,rgb(11,11,13)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-[80vh] w-full max-w-6xl flex-col items-center justify-center px-5 py-24 text-center md:min-h-screen md:px-8 md:py-32">
        <p
          className="studios-fade-up font-display text-[11px] uppercase tracking-[0.5em] text-[rgb(var(--studios-accent))] md:text-sm"
          style={{ animationDelay: "0ms" }}
        >
          Episode 01 · Available Now
        </p>

        <h1
          className="studios-fade-up font-display mt-6 text-[clamp(3rem,16vw,4.5rem)] leading-none text-[rgb(var(--studios-text))] md:text-8xl lg:text-[9rem]"
          style={{ animationDelay: "100ms" }}
        >
          <span className="block">GALILEYO</span>
          <span className="block text-[rgb(var(--studios-accent))]">
            STUDIOS
          </span>
        </h1>

        <p
          className="studios-fade-up font-editorial mt-8 max-w-2xl text-lg leading-relaxed text-[rgb(var(--studios-text-muted))] md:text-2xl"
          style={{ animationDelay: "200ms" }}
        >
          Original short-form films from the front lines of the new resistance.
        </p>

        <div
          className="studios-fade-up mt-12 w-full"
          style={{ animationDelay: "300ms" }}
        >
          <StudiosCountdown targetDate={nextEpisodeDate} />
        </div>

        <div
          className="studios-fade-up mt-12 flex w-full flex-col items-center justify-center gap-4 sm:flex-row"
          style={{ animationDelay: "400ms" }}
        >
          <Button
            asChild
            size="lg"
            className="font-display h-12 w-full max-w-[20rem] rounded-full bg-[rgb(var(--studios-accent))] text-sm uppercase tracking-[0.25em] text-[rgb(11,11,13)] shadow-[0_15px_40px_-15px_rgba(200,160,74,0.7)] hover:bg-[rgb(var(--studios-accent-hi))] sm:w-auto sm:min-w-[16rem]"
          >
            <Link href="/studios/watch/episode-1">
              <Play className="size-4" aria-hidden />
              Watch Episode 1 Free
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="font-display h-12 w-full max-w-[20rem] rounded-full border-[rgb(var(--studios-accent))]/70 bg-transparent text-sm uppercase tracking-[0.25em] text-[rgb(var(--studios-text))] hover:border-[rgb(var(--studios-accent))] hover:bg-[rgb(var(--studios-accent))]/10 hover:text-[rgb(var(--studios-accent-hi))] sm:w-auto sm:min-w-[16rem]"
          >
            <Link href="/studios/producers">
              Become a Producer
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
