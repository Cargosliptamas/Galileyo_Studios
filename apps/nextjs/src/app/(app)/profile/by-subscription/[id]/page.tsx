import type { Metadata, ResolvingMetadata } from "next";
import { notFound, redirect } from "next/navigation";

import type { PageProps } from "~/lib/types/page";
import { getSession } from "~/auth/server";
import InfluencerPage, {
  getProfileInfo,
} from "~/components/influencer/influencer-page";
import { getTitle } from "~/lib/metadata";

type Props = PageProps<{ id: string }>;

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata | undefined> {
  const { id } = await params;
  const resolved = await parent;

  const data = await getProfileInfo(id, "subscription");
  if (!data) {
    return undefined;
  }

  if (data.alias) {
    return {
      title: resolved.title,
    };
  }

  const title = getTitle([data.title, resolved.title]);

  return {
    title,
  };
}

export default async function BySubscription({ params }: Props) {
  const { id } = await params;
  const session = await getSession();

  const data = await getProfileInfo(id, "subscription");

  if (!data) {
    return notFound();
  }

  if (data.alias) {
    return redirect(`/influencer/${data.alias}`);
  }

  return (
    <InfluencerPage
      id={id}
      info={data}
      isFollowerList={false}
      isLoggedIn={!!session?.user.id}
    />
  );
}
