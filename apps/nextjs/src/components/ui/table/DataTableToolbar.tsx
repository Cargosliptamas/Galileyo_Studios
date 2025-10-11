import type { Table } from "@tanstack/react-table";
import { CircleX } from "lucide-react";

import { Button } from "@galileyo/ui/button";
import { Input } from "@galileyo/ui/input";

import { statuses } from "./data/data";
import { DataTableFacetedFilter } from "./DataTableFacetedFilter";
import { DataTableViewOptions } from "./DataTableViewOptions";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchColumn?: string;
  allowStatusFilter?: boolean;
  searchTerm?: string;
  onSearchChange?: (filter: string | undefined) => void;
  canToggleColumns?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  searchColumn,
  allowStatusFilter,
  searchTerm,
  onSearchChange,
  canToggleColumns,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {searchColumn && (
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Search"
              value={
                searchTerm ??
                (table.getColumn(searchColumn)?.getFilterValue() as
                  | string
                  | undefined) ??
                ""
              }
              onChange={(event) => {
                table
                  .getColumn(searchColumn)
                  ?.setFilterValue(event.target.value);
                onSearchChange?.(event.target.value);
              }}
              className="h-8 w-[150px] lg:w-[250px]"
            />
          </div>
        )}
        {allowStatusFilter && table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              onSearchChange?.(undefined);
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <CircleX className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      {canToggleColumns && <DataTableViewOptions table={table} />}
    </div>
  );
}
