"use client";

import {
  Bar,
  CartesianGrid,
  Cell,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@galileyo/ui/card";

interface DataPoint {
  name: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: DataPoint[];
  title?: string;
  description?: string;
  height?: number;
  showGrid?: boolean;
  color?: string;
  layout?: "vertical" | "horizontal";
  formatValue?: (value: number) => string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export function BarChart({
  data,
  title,
  description,
  height = 300,
  showGrid = true,
  color = "hsl(var(--primary))",
  layout = "vertical",
  formatValue,
}: BarChartProps) {
  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{
          top: 10,
          right: 10,
          left: layout === "horizontal" ? 80 : 0,
          bottom: 0,
        }}
      >
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        )}
        {layout === "vertical" ? (
          <>
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs text-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: number) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value.toString();
              }}
              className="text-xs text-muted-foreground"
            />
          </>
        ) : (
          <>
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: number) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value.toString();
              }}
              className="text-xs text-muted-foreground"
            />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={70}
              className="text-xs text-muted-foreground"
            />
          </>
        )}
        <Tooltip
          content={({ active, payload }) => {
            const rawPayload: unknown = payload;
            if (
              !active ||
              !Array.isArray(rawPayload) ||
              rawPayload.length === 0
            ) {
              return null;
            }
            const payloadItems = rawPayload as unknown[];
            const item = payloadItems[0];
            if (!isRecord(item)) return null;
            const nameRaw = item.name;
            const valueRaw = item.value;
            const itemName =
              typeof nameRaw === "string"
                ? nameRaw
                : typeof nameRaw === "number"
                  ? nameRaw.toString()
                  : "";
            const itemValue = typeof valueRaw === "number" ? valueRaw : 0;
            return (
              <div className="rounded-lg border bg-background p-3 shadow-lg">
                <p className="mb-1 text-sm font-medium">{itemName}</p>
                <p className="text-sm text-muted-foreground">
                  {formatValue
                    ? formatValue(itemValue)
                    : itemValue.toLocaleString()}
                </p>
              </div>
            );
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color ?? color} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );

  if (!title) {
    return chartContent;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>{chartContent}</CardContent>
    </Card>
  );
}
