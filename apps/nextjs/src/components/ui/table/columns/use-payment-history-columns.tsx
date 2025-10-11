"use client";

import { FileDown } from "lucide-react";

import type { PaymentHistoryType } from "@galileyo/api/schemas";
import { Button } from "@galileyo/ui/button";
import { toast } from "@galileyo/ui/toast";

import type { ColumnDefWithLabel } from "./types";
import { downloadInvoice } from "~/app/actions";
import { formatCardNumber } from "~/lib/formatter";
import { PaymentStatusBadge } from "../../payment-status-badge";
import { DataTableColumnHeader } from "../DataTableColumnHeader";

export const usePaymentHistoryColumns = () => {
  const handleDownloadInvoice = async (invoiceId: number) => {
    try {
      const data = await downloadInvoice(invoiceId);

      const blob = new Blob([data], { type: "application/pdf" });
      // Download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Galileyo-Invoice-${invoiceId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download invoice");
    }
  };

  const paymentHistoryColumns: ColumnDefWithLabel<PaymentHistoryType>[] = [
    {
      accessorKey: "id",
      label: "ID",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={"ID"} />
      ),
    },
    {
      accessorKey: "title",
      label: "Title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={""} />
      ),
      cell: ({ row }) => `${row.original.title} (#${row.original.invoice_id})`,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "total",
      label: "Total",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={"Total"} />
      ),
      cell: ({ row }) =>
        Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(row.getValue("total")),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "status",
      label: "Status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={"Status"} />
      ),
      cell: ({ row }) => <PaymentStatusBadge payment={row.original} />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "card_number",
      label: "Card Number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={"Card Number"} />
      ),
      cell: ({ row }) =>
        row.original.card_number
          ? formatCardNumber(row.original.card_number)
          : "",
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "created_at",
      label: "Created At",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={"Created At"} />
      ),
      cell: ({ row }) =>
        new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(row.original.created_at)),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={"Actions"} />
      ),
      cell: ({ row }) =>
        row.original.is_success &&
        row.original.type === "authorize" && (
          <Button
            size="sm"
            className="flex items-center justify-center"
            onClick={() => handleDownloadInvoice(row.original.invoice_id)}
          >
            <FileDown className="mr-2" />
            PDF
          </Button>
        ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return {
    paymentHistoryColumns,
  };
};
