import { Hono } from "hono";
import { z } from "zod/v4";

import { getInfo } from "@galileyo/metascraper";

import { validate } from "../helpers/validator.js";

const link = new Hono();

const LinkPreviewRequest = z.object({
  url: z.url(),
});

link.post("/", validate("json", LinkPreviewRequest), async (c) => {
  const { url } = c.req.valid("json");

  const preview = await getInfo(url);

  return c.json(preview);
});

export default link;
