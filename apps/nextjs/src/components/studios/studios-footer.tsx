import Link from "next/link";

import { StudiosBrand } from "./studios-brand";

const FOOTER_LINKS = [
  {
    heading: "Watch",
    links: [
      { href: "/studios", label: "Studios Home" },
      { href: "/studios/episodes", label: "All Episodes" },
      { href: "/studios/membership", label: "Bronze Membership" },
    ],
  },
  {
    heading: "Get Involved",
    links: [
      { href: "/studios/producers", label: "Become a Producer" },
      { href: "/studios/sponsors", label: "Sponsor Inquiry" },
      { href: "/studios/affiliates", label: "Affiliate Marketplace" },
    ],
  },
  {
    heading: "About",
    links: [
      { href: "/studios/about", label: "The Project" },
      { href: "/contact", label: "Contact" },
      { href: "/terms-of-service", label: "Terms" },
      { href: "/privacy-policy", label: "Privacy" },
    ],
  },
] as const;

export function StudiosFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[rgb(var(--studios-border))]/60 bg-[rgb(var(--studios-bg))]">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-8 md:py-20">
        <div className="space-y-4">
          <StudiosBrand size="lg" />
          <p className="font-editorial max-w-md text-sm leading-relaxed text-[rgb(var(--studios-text-muted))]">
            Original short-form films from the front lines of the new
            resistance. Built episode by episode, funded by the people who want
            to see them made.
          </p>
        </div>

        {FOOTER_LINKS.map((column) => (
          <div key={column.heading} className="space-y-3">
            <h4 className="font-display text-xs uppercase tracking-[0.3em] text-[rgb(var(--studios-accent))]">
              {column.heading}
            </h4>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[rgb(var(--studios-text-muted))] transition-colors hover:text-[rgb(var(--studios-text))]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[rgb(var(--studios-border))]/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-[rgb(var(--studios-text-muted))] md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4 md:px-8">
          <p>© {year} Galileyo Studios. All rights reserved.</p>
          <p>
            Designed and Developed by{" "}
            <a
              href="https://boldstudios.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[rgb(var(--studios-text))] no-underline transition-colors duration-200 hover:text-[rgb(var(--studios-accent-hi))] hover:underline"
            >
              BOLD Studios
            </a>
            .
          </p>
          <p className="font-display tracking-[0.22em]">
            A GALILEYO PRODUCTION
          </p>
        </div>
      </div>
    </footer>
  );
}
