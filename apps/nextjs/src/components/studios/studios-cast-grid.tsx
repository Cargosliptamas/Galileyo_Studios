import { ArrowUpRight } from "lucide-react";

import { cn } from "@galileyo/ui";

import type { CastMember } from "~/lib/studios/cast";

interface StudiosCastGridProps {
  members: CastMember[];
  className?: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Shared cast presentation: an elegant gold initial-monogram circle (Bebas
 * Neue) beside the performer's name, role, and an optional IMDb link. Used on
 * the landing about strip and each episode detail page so the voiceover cast
 * reads identically everywhere.
 */
export function StudiosCastGrid({ members, className }: StudiosCastGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5",
        className,
      )}
    >
      {members.map((member) => (
        <article
          key={member.id}
          className="flex items-center gap-5 rounded-2xl border border-[rgb(var(--studios-border))]/60 bg-[rgb(var(--studios-surface))]/60 p-5 transition-colors hover:border-[rgb(var(--studios-accent))]/50"
        >
          <div
            className="flex size-16 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--studios-accent))]/40 bg-[rgb(var(--studios-surface-hi))] ring-1 ring-inset ring-[rgb(var(--studios-accent))]/15"
            aria-hidden
          >
            <span className="font-display text-2xl leading-none tracking-[0.08em] text-[rgb(var(--studios-accent))]">
              {initials(member.name)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg text-[rgb(var(--studios-text))]">
              {member.name}
            </p>
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-[rgb(var(--studios-text-muted))]">
              {member.role}
            </p>
            {member.imdbUrl ? (
              <a
                href={member.imdbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-[rgb(var(--studios-accent))] transition-colors hover:text-[rgb(var(--studios-accent-hi))]"
              >
                IMDb
                <ArrowUpRight className="size-3" aria-hidden />
              </a>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
