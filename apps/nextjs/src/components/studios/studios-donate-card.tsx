"use client";

import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@galileyo/ui/button";

import { FadeUp, STUDIOS_SPRING } from "./motion";

export function StudiosDonateCard() {
  const reduce = useReducedMotion();

  return (
    <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-16 md:py-20">
      <FadeUp className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <motion.div
          whileHover={reduce ? undefined : { y: -4 }}
          transition={STUDIOS_SPRING}
          className="flex flex-col items-center gap-6 rounded-2xl border border-[rgb(var(--studios-accent))]/50 bg-[rgb(var(--studios-surface))]/60 p-8 text-center transition-shadow duration-300 hover:shadow-[0_30px_70px_-30px_rgba(200,160,74,0.5)] md:p-12"
        >
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
        </motion.div>
      </FadeUp>
    </section>
  );
}
