export const flags = ["show-map"] as const;

export type FlagTypes = (typeof flags)[number];

// default flags
export const flagDefaults: Record<FlagTypes, boolean> = {
  "show-map": false,
};
