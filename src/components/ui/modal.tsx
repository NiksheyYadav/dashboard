"use client";

import { cn } from "@/lib/utils";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ReactNode } from "react";

interface SimpleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  closeOnOverclick?: boolean;
}

export default function SimpleDialog({
  isOpen,
  onClose,
  children,
  closeOnOverclick = true,
}: SimpleDialogProps) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          onClick={closeOnOverclick ? onClose : undefined}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className={cn(
              "max-h-[90vh] overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900 animate-zoom-in"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
