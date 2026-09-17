// components/ui/toaster.tsx

'use client';

import { useEffect, useState } from 'react';
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';

export function Toaster() {
  const [mounted, setMounted] = useState(false);
  const { toasts } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        open,
        onOpenChange,
        ...props
      }) {
        return (
          <Toast key={id} onOpenChange={onOpenChange} open={open} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
