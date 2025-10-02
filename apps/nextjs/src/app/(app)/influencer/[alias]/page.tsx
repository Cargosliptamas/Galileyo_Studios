import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import type { PageProps } from "~/lib/types/page";
import { getSession } from "~/auth/server";
import InfluencerPageComponent, {
  getProfileInfo,
} from "~/components/influencer/influencer-page";
import { getTitle } from "~/lib/metadata";

type Props = PageProps<{ alias: string }>;

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata | undefined> {
  const { alias } = await params;
  const resolved = await parent;

  const data = await getProfileInfo(alias, "alias");

  if (!data) {
    return {
      title: resolved.title,
    };
  }

  const title = getTitle([data.title, resolved.title]);

  return {
    title,
  };
}

export default async function InfluencerPage({ params }: Props) {
  const { alias } = await params;
  const session = await getSession();

  const info = await getProfileInfo(alias, "alias", session?.user.id);

  if (!info) {
    return notFound();
  }

  return (
    <InfluencerPageComponent
      id={alias}
      info={info}
      isFollowerList={false}
      isLoggedIn={!!session?.user.id}
    />
  );
}
