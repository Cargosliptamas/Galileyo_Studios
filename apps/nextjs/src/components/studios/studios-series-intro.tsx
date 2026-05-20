export function StudiosSeriesIntro() {
  return (
    <section className="border-t border-[rgb(var(--studios-border))]/40 bg-[rgb(var(--studios-bg))] py-24 md:py-32">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 md:grid-cols-[auto_1fr] md:px-8">
        <div className="space-y-3">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
            The Series
          </p>
          <p className="font-display text-3xl leading-tight text-[rgb(var(--studios-text))] md:text-4xl">
            Seven episodes.
            <br />
            One story.
          </p>
        </div>
        <div className="space-y-6 text-[rgb(var(--studios-text-muted))]">
          <p className="font-editorial text-xl leading-relaxed text-[rgb(var(--studios-text))] md:text-2xl">
            Galileyo Studios is the cinematic arm of a platform built for the
            people the rest of media won&apos;t touch.
          </p>
          <p className="font-editorial text-base leading-relaxed md:text-lg">
            Across seven short-form episodes we trace the arc of a country that
            forgot how to push back, and the people who finally remember.
            Soldiers, sisters, neighbors, kids. Real characters. Real stakes.
            Made by independents, funded by the audience, distributed without
            asking permission.
          </p>
          <p className="font-editorial text-base leading-relaxed md:text-lg">
            Episode 1 is free with an email. The rest you watch by buying a
            ticket, joining Bronze, or becoming a producer. Either way you help
            us shoot the next one.
          </p>
        </div>
      </div>
    </section>
  );
}
