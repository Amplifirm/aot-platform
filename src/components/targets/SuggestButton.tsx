"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SuggestTargetDialog } from "./SuggestTargetDialog";

interface SuggestButtonProps {
  targetType: "person" | "country" | "idea";
  variant?: "default" | "outline";
  size?: "default" | "sm";
  label?: string;
}

const defaultLabels = {
  person: "Suggest Person",
  country: "Suggest Country",
  idea: "Suggest Idea",
};

export function SuggestButton({
  targetType,
  variant = "default",
  size = "sm",
  label,
}: SuggestButtonProps) {
  return (
    <SuggestTargetDialog
      targetType={targetType}
      trigger={
        <Button variant={variant} size={size} className="rounded-lg">
          <Plus className="h-4 w-4 mr-2" />
          {label || defaultLabels[targetType]}
        </Button>
      }
    />
  );
}
