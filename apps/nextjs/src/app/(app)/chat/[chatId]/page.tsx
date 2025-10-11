import { HydrateClient } from "~/trpc/server";

export default function ChatPage() {
  return (
    <HydrateClient>
      <div className="space-y-4 p-4">chat page</div>
    </HydrateClient>
  );
}
