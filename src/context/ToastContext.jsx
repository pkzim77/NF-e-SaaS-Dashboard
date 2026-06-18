import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [message, setMessage] = useState(null);
  const timer = useRef(null);

  const showToast = useCallback((msg) => {
    setMessage(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2600);
  }, []);

  return <ToastContext.Provider value={{ message, showToast }}>{children}</ToastContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx.showToast;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToastMessage() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastMessage must be used within a ToastProvider');
  return ctx.message;
}
