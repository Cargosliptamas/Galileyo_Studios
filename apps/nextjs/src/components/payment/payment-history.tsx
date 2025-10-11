"use client";

import type { PaginationState } from "@tanstack/react-table";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";
import { usePaymentHistoryColumns } from "../ui/table/columns/use-payment-history-columns";
import { DataTable } from "../ui/table/DataTable";

export function PaymentHistory() {
  const trpc = useTRPC();

  const { paymentHistoryColumns } = usePaymentHistoryColumns();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: paymentHistory, isLoading: isPaymentHistoryLoading } = useQuery(
    trpc.payment.getPaymentHistory.queryOptions({
      cursor: pagination.pageIndex,
      limit: pagination.pageSize,
    }),
  );

  return (
    <DataTable
      data={paymentHistory?.list ?? []}
      columns={paymentHistoryColumns}
      serverSide
      rowCount={paymentHistory?.count ?? 0}
      paginationState={pagination}
      onPaginationChange={setPagination}
      isLoading={isPaymentHistoryLoading}
    />
  );
}
