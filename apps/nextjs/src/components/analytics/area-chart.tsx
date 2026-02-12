"use client";

import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  AreaChart as RechartsAreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@galileyo/ui/card";

interface DataPoint {
  date: string;
  [key: string]: string | number;
}

interface AreaChartProps {
  data: DataPoint[];
  title?: string;
  description?: string;
  dataKeys: {
    key: string;
    label: string;
    color: string;
  }[];
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  formatXAxis?: (value: string) => string;
  formatTooltip?: (value: number) => string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export function AreaChart({
  data,
  title,
  description,
  dataKeys,
  xAxisKey = "date",
  height = 300,
  showGrid = true,
  formatXAxis,
  formatTooltip,
}: AreaChartProps) {
  const gradientIds = useMemo(
    () =>
      dataKeys.map(
        (dk) => `gradient-${dk.key}-${Math.random().toString(36).slice(2)}`,
      ),
    [dataKeys],
  );

  const defaultFormatXAxis = (value: string) => {
    // Try to parse and format the date
    if (value.includes("-")) {
      const parts = value.split("-");
      if (parts.length === 3) {
        // Full date: YYYY-MM-DD
        return `${parts[1]}/${parts[2]}`;
      } else if (parts.length === 2) {
        // Month: YYYY-MM
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return months[parseInt(parts[1] ?? "", 10) - 1] ?? parts[1];
      }
    }
    return value;
  };

  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          {dataKeys.map((dk, index) => (
            <linearGradient
              key={dk.key}
              id={gradientIds[index]}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={dk.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={dk.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        )}
        <XAxis
          dataKey={xAxisKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value: string) => {
            return formatXAxis?.(value) ?? defaultFormatXAxis(value) ?? "";
          }}
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
        <Tooltip
          content={({ active, payload, label }) => {
            const rawPayload: unknown = payload;
            if (
              !active ||
              !Array.isArray(rawPayload) ||
              rawPayload.length === 0
            ) {
              return null;
            }
            const labelText =
              typeof label === "string" ? label : String(label ?? "");
            return (
              <div className="rounded-lg border bg-background p-3 shadow-lg">
                <p className="mb-2 text-sm font-medium">
                  {formatXAxis?.(labelText) ?? defaultFormatXAxis(labelText)}
                </p>
                {rawPayload.map((entry, index) => {
                  if (!isRecord(entry)) return null;
                  const rawDataKey = entry.dataKey;
                  const dataKeyValue =
                    typeof rawDataKey === "string" ||
                    typeof rawDataKey === "number"
                      ? rawDataKey
                      : `series-${index}`;
                  const dataKeyLabel = String(dataKeyValue);
                  const entryColor =
                    typeof entry.color === "string"
                      ? entry.color
                      : "currentColor";
                  const entryValue =
                    typeof entry.value === "number" ? entry.value : 0;
                  const matchingDataKey = dataKeys.find(
                    (dk) => dk.key === dataKeyLabel,
                  );
                  return (
                    <div
                      key={dataKeyValue}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: entryColor }}
                      />
                      <span className="text-muted-foreground">
                        {matchingDataKey?.label ?? dataKeyLabel}:
                      </span>
                      <span className="font-medium">
                        {formatTooltip
                          ? formatTooltip(entryValue)
                          : entryValue.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          }}
        />
        {dataKeys.map((dk, index) => (
          <Area
            key={dk.key}
            type="monotone"
            dataKey={dk.key}
            stroke={dk.color}
            strokeWidth={2}
            fill={`url(#${gradientIds[index]})`}
          />
        ))}
      </RechartsAreaChart>
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
