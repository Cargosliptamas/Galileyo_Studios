import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative min-h-[70vh] overflow-hidden px-6 py-24 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-fuchsia-500/20 blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[-10rem] h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-fuchsia-500/10 via-purple-500/10 to-sky-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto w-full max-w-md select-none">
          <svg
            className="mx-auto h-28 w-full sm:h-36"
            viewBox="0 0 800 240"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-labelledby="heroTitle heroDesc"
          >
            <title id="heroTitle">404</title>
            <desc id="heroDesc">404</desc>
            <defs>
              <linearGradient id="grad404" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="rgb(59 130 246)" />
                <stop offset="50%" stopColor="rgb(139 92 246)" />
                <stop offset="100%" stopColor="rgb(236 72 153)" />
              </linearGradient>
              <filter
                id="blurGlow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g filter="url(#blurGlow)">
              <text
                x="50%"
                y="55%"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, Apple Color Emoji, Segoe UI Emoji"
                fontSize="160"
                fontWeight="800"
                fill="none"
                stroke="url(#grad404)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                404
              </text>
              <text
                x="50%"
                y="55%"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, Apple Color Emoji, Segoe UI Emoji"
                fontSize="160"
                fontWeight="800"
                fill="url(#grad404)"
                opacity="0.08"
              >
                404
              </text>
            </g>
            <g opacity="0.25" stroke="url(#grad404)" strokeWidth="2">
              <circle cx="70" cy="40" r="3" fill="currentColor" />
              <circle cx="720" cy="60" r="3" fill="currentColor" />
              <circle cx="120" cy="200" r="3" fill="currentColor" />
              <circle cx="680" cy="190" r="3" fill="currentColor" />
              <path d="M70 40 L120 200 M720 60 L680 190" />
            </g>
          </svg>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-6 text-base leading-7 text-muted-foreground">
          Sorry, we couldn’t find the page you’re looking for. It might have
          been moved, renamed, or it never existed.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
