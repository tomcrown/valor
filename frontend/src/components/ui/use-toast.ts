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
    console.log(`[Toast] ${props.title}`, props.description);
  }
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: number }>>([]);

  const showToast = useCallback((props: ToastProps) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...props, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

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
