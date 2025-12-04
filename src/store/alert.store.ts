import { create } from 'zustand';

interface AlertOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertState extends AlertOptions {
  visible: boolean;
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  visible: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  onConfirm: undefined,
  onCancel: undefined,

  showAlert: (options) =>
    set({
      visible: true,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
    }),

  hideAlert: () =>
    set({
      visible: false,
      // Optional: Reset values after hiding to avoid flicker on next open
      // title: '', 
      // message: '' 
    }),
}));