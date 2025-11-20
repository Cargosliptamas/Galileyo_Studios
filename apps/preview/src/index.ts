import { serve } from "@hono/node-server";
import { Hono } from "hono";

import { env } from "./env.js";
import { initRoutes } from "./routes/index.js";

const app = new Hono();

app.get("/", (c) => {
  return c.json({ success: true });
});

initRoutes(app);

serve(
  {
    fetch: app.fetch,
    port: env.PREVIEW_PORT,
  },
  (info) => {
    console.log(`Preview server is running on http://localhost:${info.port}`);
  },
);
