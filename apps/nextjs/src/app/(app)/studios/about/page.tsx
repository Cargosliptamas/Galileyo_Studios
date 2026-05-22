import type { Metadata } from "next";
import Link from "next/link";
import { Camera, CheckCircle2, Clock, ShieldCheck } from "lucide-react";

import { cn } from "@galileyo/ui";

import { CAST_FULL, CREW } from "~/lib/studios/cast";

export const metadata: Metadata = {
  title: "About",
  description:
    "The people behind Galileyo Studios. Why this series exists, where it goes, and who is in front of and behind the camera.",
};

const TONES = [
  "from-amber-500/25",
  "from-rose-500/20",
  "from-emerald-500/15",
  "from-sky-500/20",
  "from-violet-500/20",
  "from-orange-500/20",
];

export default function AboutPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-500/25 via-zinc-900 to-zinc-950"
          aria-hidden
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(11,11,13,0.4)_0%,rgba(11,11,13,0.92)_85%,rgb(11,11,13)_100%)]" />
        <div className="mx-auto flex min-h-[55vh] w-full max-w-6xl flex-col justify-end px-5 py-20 md:px-8 md:py-28">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
            The People
          </p>
          <h1 className="font-display mt-4 text-[clamp(2.25rem,9vw,3.5rem)] leading-[1.05] text-[rgb(var(--studios-text))] md:text-7xl">
            The People Behind
            <br />
            the Resistance.
          </h1>
          <p className="font-editorial mt-6 max-w-2xl text-lg text-[rgb(var(--studios-text-muted))] md:text-xl">
            Galileyo Studios is two friends, a small crew, and a refusal to wait
            for permission. The series is fiction. The fight underneath it is
            not.
          </p>
        </div>
      </section>

      <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-20 md:py-28">
        <div className="mx-auto w-full max-w-3xl px-5 md:px-8">
          <p className="font-display text-[11px] uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
            Why this series exists
          </p>
          <h2 className="font-display mt-3 text-3xl text-[rgb(var(--studios-text))] md:text-5xl">
            The other side has the cameras.
          </h2>
          <div className="font-editorial mt-8 space-y-6 text-base leading-relaxed text-[rgb(var(--studios-text))] md:text-lg">
            <p>
              We spent years watching the audience we belong to get told the
              same story by people who do not believe it. The faith gets
              flattened, the freedom gets caricatured, and the heroes look
              nothing like the people we actually know. So we wrote our own.
            </p>
            <p>
              Seven episodes. One soldier, one girl, one country buckling under
              the weight of a tech rollout that was never meant for humans. The
              world breaks slowly, and then all at once, and the question
              becomes who you would fight for and what you would give up to do
              it.
            </p>
            <p>
              We are not making this for industry awards. We are making it for
              the people who already know the cost. The script is locked, the
              first episode is shot, and the rest are funded one producer at a
              time. Every dollar from the producer page goes back into the next
              episode. That is the entire model.
            </p>
            <p>
              The companion game extends the same world into interactive space.
              Different medium, same fight. Same audience, same promise: your
              money on the screen, your name on the credits, the rest of the
              audience gets the result for free or for a few bucks.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-20 md:py-28">
        <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-display text-[11px] uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
                Cast
              </p>
              <h2 className="font-display mt-3 text-3xl text-[rgb(var(--studios-text))] md:text-5xl">
                Who is in front of the camera.
              </h2>
            </div>
            <div className="flex items-start gap-2 rounded-2xl border border-dashed border-[rgb(var(--studios-border))]/70 bg-[rgb(var(--studios-surface))]/50 p-4 text-left md:max-w-sm">
              <Clock
                className="mt-0.5 size-4 shrink-0 text-[rgb(var(--studios-accent))]"
                aria-hidden
              />
              <p className="font-editorial text-xs text-[rgb(var(--studios-text-muted))]">
                Cast list pending confirmation. Update before launch. Only names
                with signed contracts ship to the public page.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {CAST_FULL.map((member, index) => {
              const tone = TONES[index % TONES.length];
              const confirmed = member.status === "confirmed";
              return (
                <article
                  key={member.id}
                  className={cn(
                    "flex gap-5 rounded-2xl border bg-[rgb(var(--studios-surface))]/60 p-5 transition-colors md:p-6",
                    confirmed
                      ? "border-[rgb(var(--studios-border))]/80 hover:border-[rgb(var(--studios-accent))]/60"
                      : "border-dashed border-[rgb(var(--studios-border))]/50",
                  )}
                >
                  <div
                    className={cn(
                      "relative flex aspect-square w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br via-zinc-900 to-zinc-950 md:w-32",
                      tone,
                    )}
                  >
                    <Camera className="size-7 text-white/30" aria-hidden />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-xl text-[rgb(var(--studios-text))]">
                        {member.name}
                      </h3>
                      {member.galileyoVerified ? (
                        <span className="font-display inline-flex items-center gap-1 rounded-full bg-[rgb(var(--studios-accent))]/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.22em] text-[rgb(var(--studios-accent-hi))]">
                          <ShieldCheck className="size-3" aria-hidden />
                          Verified on Galileyo
                        </span>
                      ) : null}
                      {!confirmed ? (
                        <span className="font-display rounded-full border border-[rgb(var(--studios-border))]/70 px-2 py-0.5 text-[10px] uppercase tracking-[0.22em] text-[rgb(var(--studios-text-muted))]">
                          Pending
                        </span>
                      ) : null}
                    </div>
                    <p className="font-display mt-1 text-[10px] uppercase tracking-[0.3em] text-[rgb(var(--studios-text-muted))]">
                      {member.role}
                    </p>
                    {member.bio ? (
                      <p className="font-editorial mt-3 text-sm text-[rgb(var(--studios-text-muted))]">
                        {member.bio}
                      </p>
                    ) : null}
                    {confirmed && member.galileyoHandle ? (
                      <Link
                        href={`/${member.galileyoHandle}`}
                        className="font-display mt-3 inline-flex w-fit items-center gap-1 text-xs uppercase tracking-[0.28em] text-[rgb(var(--studios-accent))] hover:text-[rgb(var(--studios-accent-hi))]"
                      >
                        View profile →
                      </Link>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-20 md:py-28">
        <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
          <div className="mb-10">
            <p className="font-display text-[11px] uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
              Crew
            </p>
            <h2 className="font-display mt-3 text-3xl text-[rgb(var(--studios-text))] md:text-5xl">
              Who is behind the camera.
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {CREW.map((member) => {
              const confirmed = member.status === "confirmed";
              return (
                <div
                  key={member.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border bg-[rgb(var(--studios-surface))]/60 p-4",
                    confirmed
                      ? "border-[rgb(var(--studios-border))]/70"
                      : "border-dashed border-[rgb(var(--studios-border))]/50",
                  )}
                >
                  {confirmed ? (
                    <CheckCircle2
                      className="size-5 shrink-0 text-[rgb(var(--studios-accent))]"
                      aria-hidden
                    />
                  ) : (
                    <Clock
                      className="size-5 shrink-0 text-[rgb(var(--studios-text-muted))]"
                      aria-hidden
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-display text-base text-[rgb(var(--studios-text))]">
                      {member.name}
                    </p>
                    <p className="font-display text-[10px] uppercase tracking-[0.3em] text-[rgb(var(--studios-text-muted))]">
                      {member.role}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-20 md:py-28">
        <div className="mx-auto w-full max-w-5xl px-5 md:px-8">
          <div className="mb-8">
            <p className="font-display text-[11px] uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
              Behind the scenes
            </p>
            <h2 className="font-display mt-3 text-3xl text-[rgb(var(--studios-text))] md:text-5xl">
              From the cutting room floor.
            </h2>
            <p className="font-editorial mt-3 max-w-xl text-base text-[rgb(var(--studios-text-muted))]">
              {/* TODO(brett-miller): drop in the mini-doc embed (Cloudflare Stream HLS) once the cut is locked. */}
              Mini-doc lands with the Episode 1 release. Placeholder until the
              cut is locked.
            </p>
          </div>

          <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[rgb(var(--studios-border))]/70 bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950">
            <div className="text-center">
              <Camera className="mx-auto size-10 text-white/40" aria-hidden />
              <p className="font-display mt-3 text-xs uppercase tracking-[0.32em] text-[rgb(var(--studios-text-muted))]">
                BTS reel coming with Episode 1
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
