import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import { SearchResultsPage } from "~/components/search/search-results-page";
import { HydrateClient } from "~/trpc/server";

function decodeSearchQuery(rawValue: string): string {
  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
}

export default async function SearchQueryPage({
  params,
  searchParams,
}: {
  params: Promise<{ query: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const [{ query: rawQuery }, { type }] = await Promise.all([
    params,
    searchParams,
  ]);
  const query = decodeSearchQuery(rawQuery).trim();

  if (!query) {
    redirect("/dashboard");
  }

  const session = await getSession();
  if (!session) {
    const callbackURL = `/search/${encodeURIComponent(query)}${
      type ? `?type=${encodeURIComponent(type)}` : ""
    }`;

    redirect(`/login?callbackURL=${encodeURIComponent(callbackURL)}`);
  }

  return (
    <HydrateClient>
      <SearchResultsPage query={query} user={session.user} showMap={true} />
    </HydrateClient>
  );
}
