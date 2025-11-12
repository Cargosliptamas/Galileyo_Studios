"use client";

import type { PlanType } from "@galileyo/api/schemas";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cn,
  Separator,
} from "@galileyo/ui";

const featureLabelMap = {
  alerts: "Alerts",
  max_phone_cnt: "Satellite Phones",
  enhanced_alert: "Enhanced Alerts",
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

const formatFeatureKey = (key: string) => {
  const label = featureLabelMap[key as keyof typeof featureLabelMap];

  if (label) {
    return label;
  }

  return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatFeatureValue = (
  key: string,
  value: string | number | boolean | undefined,
) => {
  if (typeof value === "undefined") {
    return "-";
  }

  if (value === true) {
    return "Yes";
  }

  if (value === false) {
    return "No";
  }

  if (value === 999 || value === "999") {
    return "Unlimited";
  }

  if (value === 0 || value === "0") {
    return "-";
  }

  if (key === "map_access") {
    switch (value) {
      case "local":
        return "Local";
      case "full_regional":
        return "Full Regional";
      case "global_extended":
        return "Global Extended";
    }

    return value;
  }

  if (key === "ad_free") {
    switch (value.toString()) {
      case "limited":
        return "Limited";
      case "true":
        return "Yes";
      default:
        return "No";
    }
  }

  if (typeof value === "number") {
    return value.toLocaleString();
  }
  return value;
};

// Key features to show in lean mode (most important ones)
const KEY_FEATURES = [
  "alerts",
  "max_phone_cnt",
  "enhanced_alert",
  "map_access",
];

export function PlanCard({
  plan,
  onUpgrade,
  onReactivate,
  isCancelled = false,
  canReactivate = false,
  showFullFeatures = false,
  previousPlan,
}: {
  plan: PlanType;
  onUpgrade: (plan: PlanType) => void;
  onReactivate?: () => void;
  isCancelled?: boolean;
  canReactivate?: boolean;
  showFullFeatures?: boolean;
  previousPlan?: PlanType | null;
}) {
  if (!canReactivate && isCancelled) {
    return null;
  }

  return (
    <Card
      // className={`relative border-slate-200 bg-white/50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600 ${plan.current ? 'ring-2 ring-primary shadow-lg' : ''} ${isCancelled ? 'opacity-75 border-red-200 dark:border-red-800' : ''}`}
      className={cn(
        "relative border-slate-200 bg-white/50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600",
        plan.current && !isCancelled && "shadow-lg ring-2 ring-primary",
        isCancelled && "shadow-lg ring-2 ring-red-500",
      )}
    >
      {plan.current && !isCancelled && (
        <div className="absolute -top-2 left-4">
          <Badge
            variant="default"
            className="bg-primary text-primary-foreground"
          >
            Current Plan
          </Badge>
        </div>
      )}

      {isCancelled && (
        <div className="absolute -top-2 left-4">
          <Badge variant="destructive" className="bg-red-500 text-white">
            Cancelled
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3 md:pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-bold md:text-xl">
              {plan.name}
            </CardTitle>
            {plan.description && (
              <CardDescription className="mt-1 text-xs text-muted-foreground md:text-sm">
                {plan.description}
              </CardDescription>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary md:text-3xl">
              {formatPrice(plan.price)}
            </div>
            <div className="text-xs text-muted-foreground md:text-sm">
              per month
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {Object.keys(plan.settings).length > 0 &&
          (() => {
            // Get all features with their formatted values
            const allFeatures = Object.entries(plan.settings)
              .map(([key, value]) => {
                const formattedValue = formatFeatureValue(key, value);
                return {
                  key: key.toString(),
                  value,
                  formattedValue,
                };
              })
              .filter(({ key }) => key);

            // Filter out features with "-" or "No" values
            const validFeatures = allFeatures.filter(
              ({ formattedValue }) =>
                formattedValue !== "-" && formattedValue !== "No",
            );

            // Compare with previous plan and filter out matching features (compare ALL valid features)
            const differentFeatures = previousPlan
              ? validFeatures.filter(({ key, value }) => {
                  // Check if previous plan has this key
                  if (!(key in previousPlan.settings)) {
                    return true; // Show this feature if previous plan doesn't have it
                  }
                  const prevValue = previousPlan.settings[key];
                  // Also check if previous plan's formatted value is "-" or "No"
                  const prevFormattedValue = formatFeatureValue(key, prevValue);
                  if (
                    prevFormattedValue === "-" ||
                    prevFormattedValue === "No"
                  ) {
                    return true; // Show this feature if previous plan doesn't have a valid value
                  }
                  return prevValue !== value;
                })
              : validFeatures;

            // Filter by showFullFeatures (mobile vs desktop) for display only
            const visibleFeatures = differentFeatures.filter(
              ({ key }) => showFullFeatures || KEY_FEATURES.includes(key),
            );

            if (visibleFeatures.length === 0) {
              return null;
            }

            return (
              <>
                <Separator className="my-3 md:my-4" />
                <div className="space-y-2 md:space-y-3">
                  <h4 className="text-xs font-semibold text-foreground md:text-sm">
                    Plan Features
                  </h4>
                  <div
                    className={cn(
                      "md:max-h-none md:overflow-visible",
                      !showFullFeatures && "max-h-[200px] overflow-y-auto",
                      showFullFeatures && "max-h-[400px] overflow-y-auto",
                    )}
                  >
                    <div className="grid gap-1.5 md:gap-2">
                      {previousPlan && (
                        <div className="flex items-center justify-between py-0.5 md:py-1">
                          <span className="text-xs text-muted-foreground md:text-sm">
                            All features from{" "}
                            <span className="font-medium">
                              {previousPlan.name}
                            </span>
                          </span>
                        </div>
                      )}
                      {visibleFeatures.map(({ key, formattedValue }) => (
                        <div
                          key={key}
                          className="flex items-center justify-between py-0.5 md:py-1"
                        >
                          <span className="text-xs text-muted-foreground md:text-sm">
                            {formatFeatureKey(key)}
                          </span>
                          <span className="text-xs font-medium md:text-sm">
                            {formattedValue}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
      </CardContent>

      {!plan.current && !isCancelled && (
        <CardFooter className="pt-4">
          <Button
            onClick={() => onUpgrade(plan)}
            className="w-full"
            variant="primary"
          >
            Switch to this Plan
          </Button>
        </CardFooter>
      )}

      {isCancelled && canReactivate && (
        <CardFooter className="pt-4">
          <div className="w-full space-y-2">
            <div className="mb-2 text-center text-sm text-muted-foreground">
              This plan has been cancelled
            </div>
            <Button onClick={onReactivate} className="w-full">
              Reactivate Plan
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
