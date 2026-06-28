import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Loader = ({ className, size = "md" }: LoaderProps) => {
  const sizeClass = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" }[size];
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClass)} />
    </div>
  );
};
