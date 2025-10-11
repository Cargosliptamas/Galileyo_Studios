import { Ellipsis } from "lucide-react";

import { Button } from "@galileyo/ui/button";

export const OpenMenuButton = () => {
  return (
    <Button
      variant="ghost"
      className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
    >
      <Ellipsis className="h-4 w-4" />
      <span className="sr-only">Open</span>
    </Button>
  );
};
