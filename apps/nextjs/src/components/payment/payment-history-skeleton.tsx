"use client";

import type { PaginationState } from "@tanstack/react-table";
import { useState } from "react";

import { usePaymentHistoryColumns } from "../ui/table/columns/use-payment-history-columns";
import { DataTable } from "../ui/table/DataTable";

export function PaymentHistorySkeleton() {
  const { paymentHistoryColumns } = usePaymentHistoryColumns();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  return (
    <DataTable
      data={[]}
      columns={paymentHistoryColumns}
      serverSide
      rowCount={50} // Placeholder count
      paginationState={pagination}
      onPaginationChange={setPagination}
      isLoading={true}
    />
  );
}
