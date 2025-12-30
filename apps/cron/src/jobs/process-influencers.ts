import type { Job, JobConfig } from "@galileyo/queue";

import influencers from "../influencers.js";
// import { db } from "@galileyo/db/client";

import { worker } from "../worker.js";

type ProcessInfluencersJob = Job<void>;

async function processInfluencers() {
  // const influencers = await db.query.influencerPage.findMany();

  // console.log(influencers);
  const availableInfluencers = influencers.filter(
    (influencer) => !influencer.disabled,
  );

  for (const influencer of availableInfluencers) {
    await worker.add("process-influencer", influencer);
  }
}

export default {
  options: {
    scheduleTime: "0 */6 * * *",
    startup: true,
  },
  process: processInfluencers,
} satisfies JobConfig<ProcessInfluencersJob>;
