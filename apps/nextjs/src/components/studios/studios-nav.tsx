import { getSession } from "~/auth/server";
import { StudiosNavContent } from "./studios-nav-content";

export async function StudiosNav() {
  const session = await getSession();
  const user = session?.user;

  return (
    <StudiosNavContent
      user={
        user
          ? {
              name: user.name ?? user.email,
              email: user.email,
              image: user.image ?? null,
            }
          : null
      }
    />
  );
}
