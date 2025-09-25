import type { Attributes } from '@flags-sdk/growthbook';
import { growthbookAdapter } from '@flags-sdk/growthbook';
import type { Identify } from 'flags';
import { dedupe, flag as flagConstruct, Flag } from 'flags/next';
import { getSession } from '~/auth/server';
import { flagDefaults, FlagTypes, flags as availableFlags } from './flags';

const identify = dedupe(async () => {
  const user = await getSession();

  return {
    userId: user?.user.id,
  };
}) satisfies Identify<Attributes>;

export const flags: Record<FlagTypes, Flag<boolean, Attributes>> = availableFlags.reduce((acc, flag) => {
  acc[flag] = flagConstruct({
    key: flag,
    adapter: growthbookAdapter.feature<boolean>(),
    defaultValue: flagDefaults[flag],
    identify,
  });
  return acc;
}, {} as Record<FlagTypes, Flag<boolean, Attributes>>);
