import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { registerNetworkErrorHandler } from '../api.js';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

let _toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = ++_toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const showSuccess = useCallback((msg) => showToast(msg, 'success'), [showToast]);
  const showError = useCallback((msg) => showToast(msg, 'error'), [showToast]);

  useEffect(() => {
    registerNetworkErrorHandler((message) => showError(message));
    return () => registerNetworkErrorHandler(null);
  }, [showError]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError }}>
      {children}
      <div className="fixed right-5 top-20 z-[1100] flex w-[min(420px,calc(100vw-2.5rem))] flex-col gap-3 sm:top-20">
        {toasts.map(t => (
          <div
            key={t.id}
            role="status"
            className={[
              'flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur',
              'bg-white/95 text-slate-900 border-slate-200',
              'dark:bg-slate-950/90 dark:text-slate-100 dark:border-slate-800',
              t.type === 'success' ? 'border-emerald-200 dark:border-emerald-500/30' : '',
              t.type === 'error' ? 'border-red-200 dark:border-red-500/30' : '',
              t.type === 'info' ? 'border-indigo-200 dark:border-indigo-500/30' : '',
            ].filter(Boolean).join(' ')}
          >
            <span
              className={[
                'mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border',
                t.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
                  : t.type === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200'
                  : 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200',
              ].join(' ')}
            >
              <i
                className={`fas ${
                  t.type === 'success' ? 'fa-check-circle' :
                  t.type === 'error' ? 'fa-exclamation-circle' :
                  'fa-info-circle'
                }`}
              />
            </span>
            <div className="min-w-0 leading-6">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
