import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message = "Something went wrong.", onRetry }: ErrorStateProps) => (
  <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
    <AlertTriangle className="w-12 h-12 text-destructive" />
    <p className="text-slate-600">{message}</p>
    {onRetry && (
      <Button variant="outline" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);
