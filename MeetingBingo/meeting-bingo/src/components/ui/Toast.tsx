import { useEffect } from 'react';
import type { Toast as ToastType } from '../../types';
import { cn } from '../../lib/utils';

interface ToastItemProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration ?? 3000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium',
        toast.type === 'success' && 'bg-green-500 text-white',
        toast.type === 'info'    && 'bg-blue-500 text-white',
        toast.type === 'warning' && 'bg-amber-500 text-white',
      )}
    >
      {toast.type === 'success' && '✅'}
      {toast.type === 'info'    && 'ℹ️'}
      {toast.type === 'warning' && '⚠️'}
      {toast.message}
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}
