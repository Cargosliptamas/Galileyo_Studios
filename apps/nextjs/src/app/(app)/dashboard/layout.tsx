import { HydrateClient } from "~/trpc/server";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HydrateClient>
      <main className="container mx-auto max-w-3xl px-2 py-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Feed</h1>
        </div>
        {children}
      </main>
    </HydrateClient>
  );
}
