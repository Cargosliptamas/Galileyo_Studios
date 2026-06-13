import type { Metadata } from "next";

import { StudiosDonateForm } from "~/components/studios/studios-donate-form";
import { buildStudiosMetadata } from "~/lib/studios/metadata";

export const metadata: Metadata = buildStudiosMetadata({
  title: "Donate",
  description:
    "Fund independent AI filmmaking. Every dollar puts the next episode on screen, free for anyone to watch.",
  path: "/studios/donate",
});

export default function StudiosDonatePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-20 md:px-8 md:py-28">
      <div className="text-center">
        <p className="font-display text-xs uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
          Fund the mission
        </p>
        <h1 className="font-display mt-4 text-[clamp(2.25rem,9vw,3.5rem)] leading-[1.05] text-[rgb(var(--studios-text))] md:text-6xl">
          Independent film,
          <br />
          made with AI, funded by you.
        </h1>
        <p className="font-editorial mx-auto mt-6 max-w-xl text-base text-[rgb(var(--studios-text-muted))] md:text-lg">
          No studio gatekeepers. No corporate notes. Just stories worth telling,
          told free of the machine that wants them silenced. Your donation keeps
          Episode 1 free and brings the next six to life.
        </p>
      </div>

      <div className="mt-12">
        <StudiosDonateForm />
      </div>
    </div>
  );
}
