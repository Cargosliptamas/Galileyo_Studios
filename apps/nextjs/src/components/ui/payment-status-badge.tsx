import type { PaymentHistoryType } from "@galileyo/api/schemas";
import { cn } from "@galileyo/ui";
import { Badge } from "@galileyo/ui/badge";

export function PaymentStatusBadge({
  payment,
}: {
  payment: PaymentHistoryType;
}) {
  const isVoid = payment.is_void === true;
  const isSuccess = payment.is_success === true && !isVoid;
  const status = isSuccess ? "Success" : isVoid ? "Voided" : "Failed";

  return (
    <Badge
      variant="outline"
      className={cn(
        "",
        isSuccess && "bg-green-50 text-green-500",
        !isSuccess && !isVoid && "bg-red-50 text-red-500",
        isVoid && "bg-gray-50 text-gray-500",
      )}
    >
      {status}
    </Badge>
  );
}
