import {
  HydrateClient,
} from "~/trpc/server";
import BlogPageComponent from "~/components/public-site/blog";

export default function BlogPage() {
  return (
    <HydrateClient>
      {/* <main className="container"> */}
        <BlogPageComponent />
      {/* </main> */}
    </HydrateClient>
  );
}
