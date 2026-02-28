import React from 'react'
import { Toaster } from 'react-hot-toast'
import { useAppStore } from '../../store/useAppStore'
import { cn } from '../../utils/cn'
import {
  CheckCircle,
  XCircle,
  Info,
  Loader2,
  X,
} from 'lucide-react'

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppStore()

  return (
    <>
      <Toaster
        position="top-right"
        containerClassName="z-50"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '16px',
            minWidth: '320px',
            maxWidth: '480px',
          },
        }}
      />
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {toasts.map((toastItem) => (
          <div
            key={toastItem.id}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm',
              'animate-in slide-in-from-right duration-300',
              toastItem.type === 'success' &&
                'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
              toastItem.type === 'error' &&
                'bg-red-500/10 border-red-500/30 text-red-400',
              toastItem.type === 'info' &&
                'bg-blue-500/10 border-blue-500/30 text-blue-400',
              toastItem.type === 'loading' &&
                'bg-primary-500/10 border-primary-500/30 text-primary-400'
            )}
          >
            <div className="flex-shrink-0">
              {toastItem.type === 'success' && (
                <CheckCircle className="w-5 h-5" />
              )}
              {toastItem.type === 'error' && (
                <XCircle className="w-5 h-5" />
              )}
              {toastItem.type === 'info' && <Info className="w-5 h-5" />}
              {toastItem.type === 'loading' && (
                <Loader2 className="w-5 h-5 animate-spin" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{toastItem.title}</p>
              {toastItem.message && (
                <p className="mt-1 text-sm opacity-80">{toastItem.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toastItem.id)}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  )
}

// Hook for using toasts
export const useToast = () => {
  const addToast = useAppStore((state) => state.addToast)
  const removeToast = useAppStore((state) => state.removeToast)

  return {
    success: (title: string, message?: string) =>
      addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) =>
      addToast({ type: 'error', title, message }),
    info: (title: string, message?: string) =>
      addToast({ type: 'info', title, message }),
    loading: (title: string, message?: string) =>
      addToast({ type: 'loading', title, message }),
    dismiss: (id: string) => removeToast(id),
  }
}
