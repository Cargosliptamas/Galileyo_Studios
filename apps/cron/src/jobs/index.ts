import type { JobConfig } from "@galileyo/queue";

import processInfluencer from "./process-influencer.js";
import processInfluencers from "./process-influencers.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const jobs: Record<string, JobConfig<any>> = {
  "process-influencer": processInfluencer,
  "process-influencers": processInfluencers,
};

export default jobs;
