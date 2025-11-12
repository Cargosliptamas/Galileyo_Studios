"use client";

import type { MongoAbility } from "@casl/ability";
import { createContext, useContext, useEffect, useState } from "react";
import { createMongoAbility } from "@casl/ability";
import { createContextualCan, useAbility as useCaslAbility } from "@casl/react";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

export interface AppAbilityType {
  action: string;
  subject: string;
}

type AbilityType = MongoAbility<
  [AppAbilityType["action"], AppAbilityType["subject"]]
>;

export const AbilityContext = createContext<AbilityType>(
  null as unknown as AbilityType,
);
export const Can = createContextualCan<AbilityType>(AbilityContext.Consumer);

export function useAbility() {
  const context = useContext(AbilityContext) as AbilityType | null;

  if (!context) {
    throw new Error("useAbility must be used within an AbilityProvider");
  }

  return useCaslAbility(AbilityContext);
}

export function AbilityProvider({
  children,
  hasSession,
}: {
  children: React.ReactNode;
  hasSession: boolean;
}) {
  // const ability = createMongoAbility<AbilityType>([]);
  const [ability, setAbility] = useState<AbilityType>(
    createMongoAbility<AbilityType>([]),
  );

  const trpc = useTRPC();
  const { data: abilities } = useQuery({
    ...trpc.profile.getAbilities.queryOptions(),
    enabled: hasSession,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (abilities) {
      setAbility(createMongoAbility<AbilityType>(abilities));
    }
  }, [abilities]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

export function updateAbility(
  ability: AbilityType,
  abilities: AppAbilityType[],
) {
  const newAbility = createMongoAbility<AbilityType>(abilities);

  ability.update(newAbility.rules);
}
