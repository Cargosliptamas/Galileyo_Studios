"use client";

import { Label, Switch } from "@galileyo/ui";

interface PaymentIntervalSwitcherProps {
  value: 1 | 12; // 1 for monthly, 12 for annual
  onValueChange: (value: 1 | 12) => void;
  className?: string;
}

export function PaymentIntervalSwitcher({
  value,
  onValueChange,
  className,
}: PaymentIntervalSwitcherProps) {
  const isAnnual = value === 12;

  const handleToggle = (checked: boolean) => {
    onValueChange(checked ? 12 : 1);
  };

  return (
    <div
      className={`flex items-center justify-center gap-3 ${className ?? ""}`}
    >
      <Label
        htmlFor="payment-interval-switch"
        className={`cursor-pointer text-sm font-medium transition-colors ${
          !isAnnual ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        Monthly
      </Label>
      <Switch
        id="payment-interval-switch"
        checked={isAnnual}
        onCheckedChange={handleToggle}
        aria-label="Toggle between monthly and annual billing"
      />
      <Label
        htmlFor="payment-interval-switch"
        className={`cursor-pointer text-sm font-medium transition-colors ${
          isAnnual ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        Annual
      </Label>
    </div>
  );
}
