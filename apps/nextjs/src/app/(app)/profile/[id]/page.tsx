import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { Card, CardContent, CardFooter, CardHeader } from "@galileyo/ui";

import type { PageProps } from "~/lib/types/page";
import { getSession } from "~/auth/server";
import { UserAvatar } from "~/components/feed/user-avatar";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { Readacted } from "~/components/readacted";
import { getUserImageUrl } from "~/lib/image";
import { getTitle } from "~/lib/metadata";
import { getUserProfile } from "~/lib/server/profile";

type Props = PageProps<{ id: string }>;

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata | undefined> {
  const { id } = await params;
  const resolved = await parent;

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

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
      <Card className="w-full max-w-full transform border-slate-200 bg-white/50 transition-all duration-300 hover:scale-[1.01] hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600 md:w-svw">
        <div className="w-full overflow-hidden rounded-t-lg">
          <ImageWithFallback
            src={getUserImageUrl(profileInfo.headerImage)}
            fallback={
              <div className="h-40 w-full bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600" />
            }
            className="h-40 w-full object-cover md:h-56"
          />
        </div>
        <CardHeader className="grid grid-cols-6 justify-between">
          <div className="col-span-6 md:col-span-4">
            <UserAvatar
              name={profileInfo.name}
              image={getUserImageUrl(profileInfo.image)}
              isVerified={false}
              isInfluencer={false}
              size="large"
            />
          </div>
          <div className="col-span-6 md:col-span-2 md:flex md:justify-end"></div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-300">
            <div className="flex items-center justify-between">
              <span className="font-medium">Phone</span>
              {profileInfo.phoneVisible ? (
                <span>{profileInfo.phone ?? "Not provided"}</span>
              ) : (
                <Readacted className="relative inline-flex h-5 w-28 items-center" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Address</span>
              {profileInfo.addressVisible ? (
                <span className="text-right">
                  {profileInfo.address ?? "Not provided"}
                </span>
              ) : (
                <Readacted className="relative inline-flex h-5 w-40 items-center" />
              )}
            </div>
          </div>
        </CardContent>
        {profileInfo.about ? (
          <CardFooter>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {profileInfo.about}
            </p>
          </CardFooter>
        ) : null}
      </Card>
    </div>
  );
}
