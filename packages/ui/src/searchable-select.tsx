"use client";

import { useId, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@galileyo/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@galileyo/ui/popover";

import { fuzzySearch } from "./fuzzy-search";

export function SearchableSelect({
  options,
  value,
  onChange,
  popoverModal = false,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  popoverModal?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  // const [value, setValue] = useState<string>("")

  return (
    <div className="*:not-first:mt-2">
      <Popover open={open} onOpenChange={setOpen} modal={popoverModal}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between border-input bg-background px-3 font-normal outline-none outline-offset-0 hover:bg-background focus-visible:outline-[3px]"
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value
                ? options.find((option) => option.value === value)?.label
                : "Select option"}
            </span>
            <ChevronDownIcon
              size={16}
              className="shrink-0 text-muted-foreground/80"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="max-h-[var(--radix-popover-content-available-height)] w-full min-w-[var(--radix-popper-anchor-width)] overflow-hidden border-input p-0"
          align="start"
          collisionPadding={8}
        >
          <Command
            filter={(value, search, keywords) => {
              let isFuzzyMatch = fuzzySearch(search, value);

              if (!isFuzzyMatch && keywords) {
                isFuzzyMatch = fuzzySearch(search, keywords[0] ?? "");
              }

              return isFuzzyMatch ? 1 : 0;
            }}
          >
            <CommandInput placeholder="Search options..." />
            <CommandList className="max-h-[16rem] overflow-y-auto overscroll-contain">
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    keywords={[option.label]}
                    onSelect={(currentValue: string) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                    {value === option.value && (
                      <CheckIcon size={16} className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
