"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@galileyo/ui/card";

interface DataPoint {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: DataPoint[];
  title?: string;
  description?: string;
  height?: number;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  formatValue?: (value: number) => string;
}

const RADIAN = Math.PI / 180;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export function PieChart({
  data,
  title,
  description,
  height = 300,
  showLegend = true,
  innerRadius = 60,
  outerRadius = 100,
  formatValue,
}: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent = 0,
  }: {
    cx: number;
    cy: number;
    midAngle?: number;
    innerRadius: number;
    outerRadius: number;
    percent?: number;
  }) => {
    if (percent < 0.05) return null; // Don't show labels for small slices
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
    const y = cy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(props) => renderCustomLabel(props)}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
          ))}
        </Pie>
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
            const valueRaw = item.value;
            const itemValue = typeof valueRaw === "number" ? valueRaw : 0;
            const nameRaw = item.name;
            const itemName =
              typeof nameRaw === "string"
                ? nameRaw
                : typeof nameRaw === "number"
                  ? nameRaw.toString()
                  : "";
            const colorRaw = item.color;
            const itemColor =
              typeof colorRaw === "string"
                ? colorRaw
                : (data[0]?.color ?? "currentColor");
            const percentage = total > 0 ? (itemValue / total) * 100 : 0;
            return (
              <div className="rounded-lg border bg-background p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: itemColor }}
                  />
                  <p className="text-sm font-medium">{itemName}</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatValue
                    ? formatValue(itemValue)
                    : itemValue.toLocaleString()}{" "}
                  ({percentage.toFixed(1)}%)
                </p>
              </div>
            );
          }}
        />
        {showLegend && (
          <Legend
            content={({ payload }) => {
              const legendPayload: unknown = payload;
              if (!Array.isArray(legendPayload) || legendPayload.length === 0) {
                return null;
              }
              return (
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                  {legendPayload.map((entry, index) => {
                    if (!isRecord(entry)) return null;
                    const colorRaw = entry.color;
                    const labelRaw = entry.value;
                    const label =
                      typeof labelRaw === "string"
                        ? labelRaw
                        : typeof labelRaw === "number"
                          ? labelRaw.toString()
                          : "";
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor:
                              typeof colorRaw === "string"
                                ? colorRaw
                                : "currentColor",
                          }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            }}
          />
        )}
      </RechartsPieChart>
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
