import { Check, Minus } from "lucide-react";

export const BooleanCell = ({ value }: { value: boolean }) => {
  return (
    <div className="flex w-full items-center justify-center">
      {value ? <Check className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
    </div>
  );
};
