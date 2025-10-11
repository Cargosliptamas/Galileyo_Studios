"use client";

import * as React from "react";
import { add, format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";
import { Calendar } from "@galileyo/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@galileyo/ui/popover";

import type { TimePickerProps } from "./time-picker";
import { TimePicker } from "./time-picker";

export interface DateTimePickerProps extends Pick<TimePickerProps, "version"> {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function DateTimePicker({
  date,
  setDate,
  version,
}: DateTimePickerProps) {
  const handleSelect = (newDay: Date | undefined) => {
    if (!newDay) return;
    if (!date) {
      setDate(newDay);
      return;
    }
    const diff = newDay.getTime() - date.getTime();
    const diffInDays = diff / (1000 * 60 * 60 * 24);
    const newDateFull = add(date, { days: Math.ceil(diffInDays) });
    setDate(newDateFull);
  };

  return (
    <div className="space-y-2">
      <Calendar
        mode="single"
        selected={date}
        onSelect={(d) => handleSelect(d)}
        autoFocus
      />
      <div className="border-t border-border p-3">
        <TimePicker setDate={setDate} date={date} version={version} />
      </div>
    </div>
  );

  // return (
  //   <Popover>
  //     <PopoverTrigger asChild>
  //       <Button
  //         variant={"outline"}
  //         className={cn(
  //           "w-[280px] justify-start text-left font-normal",
  //           !date && "text-muted-foreground"
  //         )}
  //       >
  //         <CalendarIcon className="mr-2 h-4 w-4" />
  //         {date ? format(date, "PPP HH:mm:ss") : <span>Pick a date</span>}
  //       </Button>
  //     </PopoverTrigger>
  //     <PopoverContent className="w-auto p-0">
  //       <Calendar
  //         mode="single"
  //         selected={date}
  //         onSelect={(d) => handleSelect(d)}
  //         autoFocus
  //       />
  //       <div className="p-3 border-t border-border">
  //         <TimePickerDemo setDate={setDate} date={date} />
  //       </div>
  //     </PopoverContent>
  //   </Popover>
  // );
}

export function DateTimePickerPopover({
  date,
  version,
  ...props
}: DateTimePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, version === "12" ? "PPP hh:mm:ss a" : "PPP HH:mm:ss")
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <DateTimePicker {...props} date={date} version={version} />
      </PopoverContent>
    </Popover>
  );
}
