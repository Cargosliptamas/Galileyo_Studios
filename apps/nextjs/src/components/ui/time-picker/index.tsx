"use client";

import { useRef, useState } from "react";

import { Label } from "@galileyo/ui";

import { TimePeriodSelect } from "./period-select";
import type { TimePickerInputProps } from "./time-picker-input";
import { TimePickerInput } from "./time-picker-input";
import type { Period } from "./time-picker-utils";

export interface TimePickerProps
  extends Pick<TimePickerInputProps, "date" | "setDate"> {
  version: "12" | "24";
}

export function TimePicker({ version, date, setDate }: TimePickerProps) {
  const [period, setPeriod] = useState<Period>("PM");

  const minuteRef = useRef<HTMLInputElement>(null);
  const hourRef = useRef<HTMLInputElement>(null);
  const secondRef = useRef<HTMLInputElement>(null);
  const periodRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center">
        <Label htmlFor="hours" className="text-xs">
          Hours
        </Label>
        <TimePickerInput
          picker={version === "12" ? "12hours" : "hours"}
          period={period}
          date={date}
          setDate={setDate}
          ref={hourRef}
          onRightFocus={() => minuteRef.current?.focus()}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minutes" className="text-xs">
          Minutes
        </Label>
        <TimePickerInput
          picker="minutes"
          id="minutes12"
          date={date}
          setDate={setDate}
          ref={minuteRef}
          onLeftFocus={() => hourRef.current?.focus()}
          onRightFocus={() => secondRef.current?.focus()}
        />
      </div>
      {version === "12" && (
        <div className="grid gap-1 text-center">
          <Label htmlFor="period" className="text-xs">
            Period
          </Label>
          <TimePeriodSelect
            period={period}
            setPeriod={setPeriod}
            date={date}
            setDate={setDate}
            ref={periodRef}
            onLeftFocus={() => secondRef.current?.focus()}
          />
        </div>
      )}
    </div>
  );
}
