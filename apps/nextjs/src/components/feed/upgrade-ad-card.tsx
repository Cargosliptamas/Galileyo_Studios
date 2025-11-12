"use client";

import { ArrowRight, Shield, Sparkles, Star, Zap } from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@galileyo/ui";

import { usePlanSwitch } from "~/hooks/use-plan-switch";

export default function UpgradeAdCard() {
  const { showPlansModal } = usePlanSwitch();

  const handleUpgrade = () => {
    showPlansModal(true);
  };

  return (
    <Card className="group relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 shadow-lg transition-all duration-300 hover:border-primary/50 hover:shadow-xl dark:from-primary/20 dark:via-primary/10 dark:to-primary/20">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-primary blur-2xl" />
      </div>

      <CardHeader className="relative pb-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 dark:bg-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold text-foreground">
              Upgrade Your Plan
            </CardTitle>
          </div>
          <Badge
            variant="default"
            className="border-primary/30 bg-primary/20 text-primary hover:bg-primary/30"
          >
            Upgrade
          </Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          Elevate your experience with exclusive features and benefits
        </CardDescription>
      </CardHeader>

      <CardContent className="relative space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-background/50 p-3 transition-colors hover:border-primary/30 dark:bg-background/30">
            <div className="rounded-md bg-primary/10 p-1.5 dark:bg-primary/20">
              <Zap className="h-4 w-4 flex-shrink-0 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                Ad-Free Experience
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                No interruptions while you browse
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-background/50 p-3 transition-colors hover:border-primary/30 dark:bg-background/30">
            <div className="rounded-md bg-primary/10 p-1.5 dark:bg-primary/20">
              <Shield className="h-4 w-4 flex-shrink-0 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                Verified Badge
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Stand out from the crowd
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-background/50 p-3 transition-colors hover:border-primary/30 dark:bg-background/30">
            <div className="rounded-md bg-primary/10 p-1.5 dark:bg-primary/20">
              <Star className="h-4 w-4 flex-shrink-0 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                Priority Support
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Assistance when needed
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-background/50 p-3 transition-colors hover:border-primary/30 dark:bg-background/30">
            <div className="rounded-md bg-primary/10 p-1.5 dark:bg-primary/20">
              <Sparkles className="h-4 w-4 flex-shrink-0 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                Exclusive Features
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Early access to new features
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleUpgrade}
          className="group/button mt-2 w-full font-semibold shadow-md transition-all duration-200 hover:shadow-lg"
          variant="primary"
          size="lg"
        >
          <span>View Plans & Upgrade</span>
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/button:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
