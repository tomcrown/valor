// ============================================================================
// FILE: hooks/use-toast.ts
// Simple toast notification hook
// ============================================================================

import { useState, useCallback } from "react";

export interface ToastProps {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

let toastCallback: ((props: ToastProps) => void) | null = null;

export function toast(props: ToastProps) {
  if (toastCallback) {
    toastCallback(props);
  } else {
    // Fallback to console if toast system not initialized
    console.log(`[Toast] ${props.title}`, props.description);
  }
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: number }>>([]);

  const showToast = useCallback((props: ToastProps) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...props, id }]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  // Register the callback
  if (!toastCallback) {
    toastCallback = showToast;
  }

  return {
    toast: showToast,
    toasts,
    dismiss: (id: number) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    },
  };
}
