import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import type { PageProps } from "~/lib/types/page";
import { getSession } from "~/auth/server";
import { UserProfilePage } from "~/components/profile/user-profile-page";
import { getTitle } from "~/lib/metadata";
import { getUserProfile } from "~/lib/server/profile";

type Props = PageProps<{ id: string }>;

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata | undefined> {
  const { id } = await params;
  const resolved = await parent;

  if (Number.isNaN(id)) {
    return undefined;
  }

  const data = await getUserProfile(Number(id));
  if (!data) {
    return undefined;
  }

  const title = getTitle([data.name, resolved.title]);

  return {
    title,
  };
}

export default async function UserPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();

  const profileInfo = await getUserProfile(Number(id), session?.user.id);

  if (!profileInfo || !session?.user.id) {
    return notFound();
  }

  return <UserProfilePage profileInfo={profileInfo} />;
}
