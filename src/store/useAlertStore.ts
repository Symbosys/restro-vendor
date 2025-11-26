import { create } from 'zustand';
import { RootStackParamList } from '../types/types';

type AlertType = 'success' | 'error' | 'info';

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  type: AlertType;
  navigateTo?: keyof RootStackParamList;
  showAlert: (
    title: string,
    message: string,
    type?: AlertType,
    navigateTo?: keyof RootStackParamList
  ) => void;
  hideAlert: () => void;
}

const useAlertStore = create<AlertState>((set) => ({
  visible: false,
  title: '',
  message: '',
  type: 'info' as AlertType,
  navigateTo: undefined as keyof RootStackParamList | undefined,
  showAlert: (
    title: string,
    message: string,
    type: AlertType = 'info',
    navigateTo?: keyof RootStackParamList
  ) => set({ visible: true, title, message, type, navigateTo }),
  hideAlert: () =>
    set({
      visible: false,
      title: '',
      message: '',
      type: 'info',
      navigateTo: undefined,
    }),
}));

export default useAlertStore;