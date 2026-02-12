"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { cn } from "@galileyo/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@galileyo/ui/card";

interface SparklineData {
  value: number;
}

interface StatCardWithSparklineProps {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ElementType;
  sparklineData?: SparklineData[];
  sparklineColor?: string;
  className?: string;
}

export function StatCardWithSparkline({
  title,
  value,
  change,
  icon: Icon,
  sparklineData,
  sparklineColor = "hsl(var(--primary))",
  className,
}: StatCardWithSparklineProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  const formattedValue =
    typeof value === "number" ? value.toLocaleString() : value;

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">{formattedValue}</div>
            {change !== undefined && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                {isPositive && (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                )}
                {isNegative && (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={cn(
                    isPositive && "text-green-500",
                    isNegative && "text-red-500",
                  )}
                >
                  {isPositive && "+"}
                  {change.toFixed(1)}%
                </span>
                <span>from last period</span>
              </p>
            )}
          </div>
          {sparklineData && sparklineData.length > 0 && (
            <div className="h-12 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData}>
                  <defs>
                    <linearGradient
                      id={`sparkline-gradient-${title.replace(/\s/g, "")}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={sparklineColor}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={sparklineColor}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={sparklineColor}
                    strokeWidth={1.5}
                    fill={`url(#sparkline-gradient-${title.replace(/\s/g, "")})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
