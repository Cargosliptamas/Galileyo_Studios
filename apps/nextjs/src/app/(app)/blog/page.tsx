import BlogPageComponent from "~/components/public-site/blog";
import { HydrateClient } from "~/trpc/server";

export default function BlogPage() {
  return (
    <HydrateClient>
      {/* <main className="container"> */}
      <BlogPageComponent />
      {/* </main> */}
    </HydrateClient>
  );
}
