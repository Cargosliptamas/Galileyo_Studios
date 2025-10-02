import { notFound } from "next/navigation";

import type { PageProps } from "~/lib/types/page";
import { getSession } from "~/auth/server";
import InfluencerPage, {
  getProfileInfo,
} from "~/components/influencer/influencer-page";

type Props = PageProps<{ id: string }>;

export default async function ByFollowerList({ params }: Props) {
  const { id } = await params;
  const session = await getSession();

  if (!session?.user.id) {
    return notFound();
  }

  const data = await getProfileInfo(id, "followerList", session.user.id);

  if (!data?.isSubscribed) {
    return notFound();
  }

  return (
    <InfluencerPage
      id={id}
      info={data}
      isFollowerList
      isLoggedIn={!!session.user.id}
    />
  );
}
