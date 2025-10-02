/* eslint-disable */
import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { env } from "~/env";
import tailwindConfig from "../../../tailwind.config";
import { StyleguideHeader } from "./header";

// Ensure this runs on the Node.js runtime (not Edge), since we use `require`.
export const runtime = "nodejs";
// If you want it to re-read on every request in dev:
// export const dynamic = "force-dynamic";

function flattenColors(
  prefix: string,
  obj: Record<string, any> = {},
  out: Record<string, string> = {},
) {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") out[prefix ? `${prefix}-${k}` : k] = v;
    else if (v && typeof v === "object")
      flattenColors(prefix ? `${prefix}-${k}` : k, v, out);
  }
  return out;
}

function sortColors(colors: Record<string, string>) {
  // Tailwind default color families that should appear at the end
  const defaultColorFamilies = [
    "slate",
    "gray",
    "zinc",
    "neutral",
    "stone",
    "red",
    "orange",
    "amber",
    "yellow",
    "lime",
    "green",
    "emerald",
    "teal",
    "cyan",
    "sky",
    "blue",
    "indigo",
    "violet",
    "purple",
    "fuchsia",
    "pink",
    "rose",
  ];

  return Object.entries(colors).sort(([nameA], [nameB]) => {
    const familyA = nameA.split("-")[0];
    const familyB = nameB.split("-")[0];

    const indexA = defaultColorFamilies.indexOf(familyA || "");
    const indexB = defaultColorFamilies.indexOf(familyB || "");

    // If both are default colors, sort by family then by number/value
    if (indexA !== -1 && indexB !== -1) {
      if (indexA !== indexB) return indexA - indexB;
      // Same family, sort by the numeric part
      const numA = parseInt(nameA.split("-")[1] || "0");
      const numB = parseInt(nameB.split("-")[1] || "0");
      return numA - numB;
    }

    // Custom colors come first
    if (indexA === -1 && indexB !== -1) return -1;
    if (indexA !== -1 && indexB === -1) return 1;

    // Both custom colors
    return nameA.localeCompare(nameB);
  });
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default async function StyleguidePage() {
  // Lazy require on the server

  const resolveConfig = require("tailwindcss/resolveConfig");

  // const tailwindConfig = require("../../tailwind.config.js"); // adjust path if needed

  const full = resolveConfig(tailwindConfig);
  const theme = full.theme || {};
  const colors = flattenColors("", theme.colors || {});
  const spacing = theme.spacing || {};
  const radii = theme.borderRadius || {};
  const shadows = theme.boxShadow || {};
  const fontSizes = theme.fontSize || {};
  const screens = theme.screens || {};
  const fontFamilies = theme.fontFamily || {};

  if (!env.NEXT_PUBLIC_STYLEGUIDE_ENABLED) {
    return notFound();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-12 p-6 md:p-10">
      <StyleguideHeader>
        <h1 className="text-4xl font-bold">Styleguide</h1>
        <p className="mt-2 text-sm text-slate-600">
          Generated from your <code>tailwind.config.js</code>
        </p>
      </StyleguideHeader>

      <Section title="Colors">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {sortColors(colors).map(([name, value]) => (
            <div
              key={name}
              className="flex flex-col gap-2 rounded-xl border p-3"
            >
              <div
                className="h-16 w-full rounded-lg border"
                style={{ background: value }}
              />
              <div className="text-xs font-medium">{name}</div>
              <div className="text-[11px] text-slate-600">{value}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Spacing">
        <div className="space-y-2">
          {Object.entries(spacing).map(([k, v]) => {
            const val =
              typeof v === "string" ? v : Array.isArray(v) ? v[0] : String(v);
            return (
              <div key={k} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium">{k}</div>
                <div className="flex-1">
                  <div
                    className="h-3 rounded bg-slate-200"
                    style={{ width: val }}
                  />
                  <div className="mt-1 text-[11px] text-slate-600">
                    {typeof v === "string" ? v : JSON.stringify(v)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Border Radius">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Object.entries(radii).map(([k, v]) => (
            <div
              key={k}
              className="flex flex-col items-start gap-3 rounded-xl border p-4"
            >
              <div
                className="h-16 w-full border bg-slate-100"
                style={{ borderRadius: String(v) }}
              />
              <div className="text-sm font-medium">{k}</div>
              <div className="text-[11px] text-slate-600">{String(v)}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Shadows">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {Object.entries(shadows).map(([k, v]) => (
            <div key={k} className="rounded-xl border p-4">
              <div
                className="h-16 w-full rounded-lg border bg-white"
                style={{ boxShadow: String(v) }}
              />
              <div className="mt-3 text-sm font-medium">{k}</div>
              <div className="text-[11px] text-slate-600">{String(v)}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Font Sizes">
        <div className="space-y-4">
          {Object.entries(fontSizes).map(([k, v]) => {
            const size = Array.isArray(v) ? v[0] : v;
            const meta = (Array.isArray(v) ? v[1] : {}) as {
              lineHeight?: string;
            };
            return (
              <div key={k} className="rounded-xl border p-4">
                <div className="mb-2 text-sm font-medium">{k}</div>
                <div
                  style={{
                    fontSize: String(size),
                    lineHeight: meta?.lineHeight || "normal",
                  }}
                  className="font-medium"
                >
                  The quick brown fox jumps over the lazy dog
                </div>
                <div className="mt-2 text-[11px] text-slate-600">
                  size: {String(size)}
                  {meta?.lineHeight ? `, line-height: ${meta.lineHeight}` : ""}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Font Families">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {Object.entries(fontFamilies).map(([name, fonts]) => (
            <div key={name} className="rounded-xl border p-4">
              <div className="mb-2 text-sm font-medium">{name}</div>
              <div
                className="text-lg"
                style={{
                  fontFamily: Array.isArray(fonts)
                    ? fonts.join(", ")
                    : String(fonts),
                }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
              <div className="mt-2 break-all text-[11px] text-slate-600">
                {Array.isArray(fonts) ? fonts.join(", ") : String(fonts)}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Breakpoints">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Object.entries(screens).map(([k, v]) => (
            <div key={k} className="rounded-xl border p-4 text-sm font-medium">
              {k}:{" "}
              <span className="text-slate-600">
                {typeof v === "string" ? v : JSON.stringify(v)}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <footer className="pt-8 text-xs text-slate-500">
        Generated {new Date().toISOString()}
      </footer>
    </div>
  );
}
