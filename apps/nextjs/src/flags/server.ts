import "server-only";

import type { Attributes } from "@flags-sdk/growthbook";
import type { Identify } from "flags";
import type { Flag } from "flags/next";
import { growthbookAdapter } from "@flags-sdk/growthbook";
import { dedupe, flag as flagConstruct } from "flags/next";

import type { FlagTypes } from "./flags";
import { getSession } from "~/auth/server";
import { flags as availableFlags, flagDefaults } from "./flags";

const identify = dedupe(async () => {
  const user = await getSession();

  return {
    userId: user?.user.id,
  };
}) satisfies Identify<Attributes>;

export const flags: Record<
  FlagTypes,
  Flag<boolean, Attributes>
> = availableFlags.reduce(
  (acc, flag) => {
    acc[flag] = flagConstruct({
      key: flag,
      adapter: growthbookAdapter.feature<boolean>(),
      defaultValue: flagDefaults[flag],
      identify,
    });
    return acc;
  },
  {} as Record<FlagTypes, Flag<boolean, Attributes>>,
);
