import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, HelpCircle, Check } from 'lucide-react';

export interface AlertModalOptions {
  title?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

interface ModalState {
  isOpen: boolean;
  message: string;
  title: string;
  type: 'info' | 'success' | 'warning' | 'error';
  confirmText: string;
  cancelText: string;
  showCancel: boolean;
}

interface ModalContextType {
  showAlert: (message: string, options?: AlertModalOptions) => Promise<boolean>;
  showConfirm: (message: string, options?: AlertModalOptions) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    message: '',
    title: '',
    type: 'info',
    confirmText: 'Am înțeles',
    cancelText: 'Anulează',
    showCancel: false,
  });

  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const showAlert = useCallback((message: string, options?: AlertModalOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      const type = options?.type || 'info';
      const defaultTitle =
        type === 'error'
          ? 'Eroare'
          : type === 'warning'
          ? 'Atenție'
          : type === 'success'
          ? 'Succes'
          : 'Notificare';

      setModalState({
        isOpen: true,
        message,
        title: options?.title || defaultTitle,
        type,
        confirmText: options?.confirmText || 'Am înțeles',
        cancelText: options?.cancelText || 'Închide',
        showCancel: options?.showCancel || false,
      });
    });
  }, []);

  const showConfirm = useCallback((message: string, options?: AlertModalOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      const type = options?.type || 'warning';
      const defaultTitle = options?.title || 'Confirmare Acțiune';

      setModalState({
        isOpen: true,
        message,
        title: defaultTitle,
        type,
        confirmText: options?.confirmText || 'Confirmă',
        cancelText: options?.cancelText || 'Anulează',
        showCancel: true,
      });
    });
  }, []);

  const handleConfirm = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  };

  const handleCancel = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  };

  // Safe global interceptor for legacy alert/confirm calls
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg: any) => {
      showAlert(String(msg || ''));
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [showAlert]);

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {/* Global Interactive Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  modalState.type === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : modalState.type === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-600'
                    : modalState.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                    : 'bg-blue-50 border-blue-200 text-blue-600'
                }`}
              >
                {modalState.type === 'error' && <AlertTriangle className="w-6 h-6" />}
                {modalState.type === 'warning' && <AlertTriangle className="w-6 h-6" />}
                {modalState.type === 'success' && <CheckCircle2 className="w-6 h-6" />}
                {modalState.type === 'info' && <Info className="w-6 h-6" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-slate-900 text-lg">
                    {modalState.title}
                  </h3>
                  <button
                    onClick={handleCancel}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  NursLab Medical Education Platform
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6 text-sm text-slate-700 leading-relaxed font-medium">
              {modalState.message}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              {modalState.showCancel && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  {modalState.cancelText}
                </button>
              )}
              <button
                type="button"
                onClick={handleConfirm}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 ${
                  modalState.type === 'error'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : modalState.type === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-brand-navy hover:bg-slate-800'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{modalState.confirmText}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
