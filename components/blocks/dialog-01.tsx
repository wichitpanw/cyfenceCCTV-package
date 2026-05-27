"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Dialog01Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "default" | "danger" | "success" | "warning";
  icon?: string;
}

export function Dialog01({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  onConfirm,
  onCancel,
  variant = "default",
  icon = "💬",
}: Dialog01Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm flex flex-col items-center p-6 rounded-2xl">
        <div className="flex justify-center mb-2">
          <div 
            className={cn(
              "mx-auto flex h-12 w-12 items-center justify-center rounded-full text-xl shadow-inner",
              variant === "danger" && "bg-red-50 text-red-600 border border-red-100",
              variant === "success" && "bg-emerald-50 text-emerald-600 border border-emerald-100",
              variant === "warning" && "bg-amber-50 text-amber-600 border border-amber-100",
              variant === "default" && "bg-gray-50 text-gray-900 border border-gray-100"
            )}
          >
            {icon}
          </div>
        </div>

        <DialogHeader className="text-center gap-0 w-full">
          <DialogTitle className="text-balance text-center text-sm font-bold text-gray-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-pretty mt-2 text-center text-xs text-gray-500 max-w-[90%] mx-auto leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-center w-full flex flex-col sm:flex-row gap-2 mt-4">
          {cancelText && (
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                onOpenChange(false);
                onCancel?.();
              }}
              className="w-full sm:flex-1 text-xs font-semibold text-gray-500 h-9"
            >
              {cancelText}
            </Button>
          )}
          <Button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
            className={cn(
              "w-full sm:flex-1 text-xs font-bold h-9 text-white",
              variant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-gray-900 hover:bg-gray-800"
            )}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
