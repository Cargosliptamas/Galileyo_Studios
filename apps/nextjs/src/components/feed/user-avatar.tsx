import { Verified } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@galileyo/ui/avatar";

export function UserAvatar({
  name,
  image,
  isVerified,
  isInfluencer,
  children,
}: {
  name: string;
  image: string | null;
  isVerified: boolean;
  isInfluencer: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-12 w-12">
        <AvatarImage src={image ?? ""} alt={name} />
        <AvatarFallback className="bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white">
          {name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {name}
          </h3>
          {isVerified && (
            <Verified className="h-4 w-4 fill-current text-cyan-500 dark:text-cyan-400" />
          )}
          {isInfluencer && (
            <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-400">
              Influencer
            </span>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
