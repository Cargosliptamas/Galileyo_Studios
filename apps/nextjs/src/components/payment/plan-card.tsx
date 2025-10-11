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

const formatFeatureValue = (value: string | number) => {
  if (value === 999 || value === "999") {
    return "Unlimited";
  }

  if (value === 0 || value === "0") {
    return "-";
  }

  if (typeof value === "number") {
    return value.toLocaleString();
  }
  return value;
};
export function PlanCard({
  plan,
  onUpgrade,
  onReactivate,
  isCancelled = false,
  canReactivate = false,
}: {
  plan: PlanType;
  onUpgrade: (plan: PlanType) => void;
  onReactivate?: () => void;
  isCancelled?: boolean;
  canReactivate?: boolean;
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

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
            {plan.description && (
              <CardDescription className="mt-1 text-sm text-muted-foreground">
                {plan.description}
              </CardDescription>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              {formatPrice(plan.price)}
            </div>
            <div className="text-sm text-muted-foreground">per month</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {Object.keys(plan.settings).length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">
                Plan Features
              </h4>
              <div className="grid gap-2">
                {Object.entries(plan.settings).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm text-muted-foreground">
                      {formatFeatureKey(key)}
                    </span>
                    <span className="text-sm font-medium">
                      {formatFeatureValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
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
