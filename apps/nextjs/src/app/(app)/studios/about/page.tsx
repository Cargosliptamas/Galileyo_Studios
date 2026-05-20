export const metadata = { title: "About" };

export default function AboutStubPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-24 md:px-8">
      <h1 className="font-display text-5xl text-[rgb(var(--studios-text))]">
        About the Project
      </h1>
      <p className="font-editorial mt-4 text-[rgb(var(--studios-text-muted))]">
        Cast, crew, and the story behind Studios ships in Phase 2.
      </p>
    </div>
  );
}
