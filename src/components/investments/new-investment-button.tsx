"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInvestments } from "./investments-provider";

export function NewInvestmentButton() {
  const { openCreate } = useInvestments();
  return (
    <Button onClick={openCreate} size="sm" className="shrink-0">
      <Plus className="h-4 w-4" />
      Nueva
    </Button>
  );
}
