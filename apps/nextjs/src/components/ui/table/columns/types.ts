import type { ColumnDef, RowData } from "@tanstack/react-table";

type ColumnDefWithLabel<TData extends RowData, TValue = unknown> = ColumnDef<
  TData,
  TValue
> & {
  label?: string;
};

export type { ColumnDefWithLabel, ColumnDef };
