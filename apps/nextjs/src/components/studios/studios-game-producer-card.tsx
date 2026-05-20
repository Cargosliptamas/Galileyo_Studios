import Link from "next/link";
import { ArrowRight, Check, Gamepad2 } from "lucide-react";

import { Button } from "@galileyo/ui/button";

import { env } from "~/env/client";
import { StudiosFundingProgress } from "./studios-funding-progress";

const INCLUSIONS = [
  "Free copy of the game on release",
  "Producer credit in the game",
  "Early access to the alpha build",
];

export function StudiosGameProducerCard() {
  return (
    <section className="bg-[rgb(var(--studios-bg))] py-12 md:py-16">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <article className="grid gap-10 rounded-2xl border border-[rgb(var(--studios-border))]/70 bg-[rgb(var(--studios-surface))]/80 p-8 md:grid-cols-[1.1fr_1fr] md:gap-12 md:p-12">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-[rgb(var(--studios-accent))]/15 text-[rgb(var(--studios-accent))]">
                <Gamepad2 className="size-5" aria-hidden />
              </span>
              <p className="font-display text-xs uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
                Help Build the Game
              </p>
            </div>
            <h2 className="font-display text-3xl text-[rgb(var(--studios-text))] md:text-5xl">
              Game Producer
              <br />
              <span className="text-[rgb(var(--studios-accent))]">$100+</span>
            </h2>
            <p className="font-editorial text-base text-[rgb(var(--studios-text-muted))] md:text-lg">
              Companion game to the series. Same world, same fight, interactive.
              Back it now and your name ships in the credits.
            </p>
            <ul className="space-y-3">
              {INCLUSIONS.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3 text-sm text-[rgb(var(--studios-text))]"
                >
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-[rgb(var(--studios-accent))]"
                    aria-hidden
                  />
                  <span className="font-editorial leading-relaxed">{line}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <Button
                asChild
                className="font-display h-12 rounded-full bg-[rgb(var(--studios-accent))] px-8 text-xs uppercase tracking-[0.25em] text-[rgb(11,11,13)] hover:bg-[rgb(var(--studios-accent-hi))]"
              >
                <Link href="/studios/producers#game">
                  Back the game
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-xl border border-[rgb(var(--studios-border))]/60 bg-[rgb(var(--studios-bg))]/60 p-6 md:p-8">
            <StudiosFundingProgress
              current={env.NEXT_PUBLIC_STUDIOS_FUNDING_GAME_CURRENT}
              target={env.NEXT_PUBLIC_STUDIOS_FUNDING_GAME_TARGET}
              label="Game funding"
              tone="ember"
            />
            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              {["$250K", "$500K", "$1M"].map((milestone) => (
                <div
                  key={milestone}
                  className="rounded-lg border border-[rgb(var(--studios-border))]/60 bg-[rgb(var(--studios-surface))]/60 px-3 py-3"
                >
                  <p className="font-display text-base text-[rgb(var(--studios-text))]">
                    {milestone}
                  </p>
                  <p className="font-display text-[9px] uppercase tracking-[0.3em] text-[rgb(var(--studios-text-muted))]">
                    Milestone
                  </p>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
