import { Avatar, AvatarFallback, AvatarImage } from "@galileyo/ui/avatar";
import { Verified } from "lucide-react";

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
      <Avatar className="w-12 h-12">
        <AvatarImage src={image ?? ''} alt={name} />
        <AvatarFallback className="bg-slate-700 text-white">
          {(name).split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-white">{name}</h3>
          {isVerified && (
            <Verified className="w-4 h-4 text-cyan-400 fill-current" />
          )}
          {isInfluencer && (
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">
              Influencer
            </span>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}