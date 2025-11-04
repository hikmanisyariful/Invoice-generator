'use client';

import * as React from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastProvider, ToastViewport } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

type SnackbarMessage = {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
  duration?: number;
};

type SnackbarContextValue = {
  showMessage: (msg: Omit<SnackbarMessage, 'id'>) => void;
};

const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<SnackbarMessage[]>([]);

  const showMessage = useCallback(
    (msg: Omit<SnackbarMessage, 'id'>) => {
      const id = crypto.randomUUID();
      const newMsg = { id, ...msg };
      setMessages((prev) => [...prev, newMsg]);

      toast({
        title: msg.title,
        description: msg.description,
        duration: msg.duration || 3000,
        variant: msg.variant === 'error' ? 'destructive' : 'default',
      });

      // auto remove message after timeout (optional)
      setTimeout(() => {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }, msg.duration || 3000);
    },
    [toast]
  );

  return (
    <SnackbarContext.Provider value={{ showMessage }}>
      <ToastProvider>
        {children}
        <ToastViewport className={cn('fixed bottom-0 right-0 p-4')} />
      </ToastProvider>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) throw new Error('useSnackbar must be used within <SnackbarProvider>');
  return context;
}
