import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";

import { Button } from "@galileyo/ui/button";

export function StudiosDonateCard() {
  return (
    <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-16 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-[rgb(var(--studios-accent))]/50 bg-[rgb(var(--studios-surface))]/60 p-8 text-center md:p-12">
          <span className="flex size-12 items-center justify-center rounded-full bg-[rgb(var(--studios-accent))]/15 text-[rgb(var(--studios-accent))]">
            <Heart className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-3xl text-[rgb(var(--studios-text))] md:text-4xl">
              Not ready to produce? Donate any amount.
            </h2>
            <p className="font-editorial mx-auto mt-3 max-w-xl text-base text-[rgb(var(--studios-text-muted))]">
              Every dollar keeps Episode 1 free and funds the next six. Give
              what you can, no credit or commitment required.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="font-display h-12 min-w-[14rem] rounded-full bg-[rgb(var(--studios-accent))] text-xs uppercase tracking-[0.25em] text-[rgb(11,11,13)] hover:bg-[rgb(var(--studios-accent-hi))]"
          >
            <Link href="/studios/donate">
              Donate Now
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
