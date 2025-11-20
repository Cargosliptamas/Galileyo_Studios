import type { Hono } from "hono";

import link from "./link.js";
import location from "./location.js";

const routes: Record<string, Hono> = {
  link,
  location,
};

export function initRoutes(app: Hono) {
  for (const [path, route] of Object.entries(routes)) {
    app.route(`/${path}`, route);
  }

  return app;
}

export default routes;
