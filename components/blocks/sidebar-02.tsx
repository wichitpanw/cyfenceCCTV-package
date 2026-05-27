import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface Sidebar02Step {
  number: number;
  label: string;
  isPassed: boolean;
  isCurrent: boolean;
  isClickable: boolean;
  isIgnored?: boolean;
}

interface Sidebar02Props {
  steps: Sidebar02Step[];
  onStepSelect: (num: number) => void;
  className?: string;
}

export function Sidebar02({ steps, onStepSelect, className }: Sidebar02Props) {
  return (
    <nav className={cn("grid grid-cols-1 sm:grid-cols-5 w-full gap-2 select-none", className)}>
      {steps.map((step) => {
        return (
          <button
            key={step.number}
            type="button"
            disabled={!step.isClickable}
            onClick={() => onStepSelect(step.number)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold text-left transition-all leading-snug border",
              step.isIgnored && "opacity-35 line-through",
              step.isCurrent
                ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                : step.isPassed
                ? "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100"
                : "bg-white border-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            <div className="shrink-0 flex items-center justify-center">
              {step.isPassed ? (
                <CheckCircle2 className={cn("h-4 w-4", step.isCurrent ? "text-white" : "text-emerald-600")} />
              ) : (
                <div 
                  className={cn(
                    "h-4 w-4 rounded-full border flex items-center justify-center font-bold text-[9px] w-4 h-4 shrink-0",
                    step.isCurrent ? "border-white text-white" : "border-gray-300 text-gray-400"
                  )}
                >
                  {step.number}
                </div>
              )}
            </div>
            <span className="truncate flex-1 whitespace-nowrap min-w-0" title={step.label}>
              {step.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
