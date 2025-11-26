import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../types/types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.resetRoot({
      index: 0,
      routes: [{ name }],
    });
  }
}



let logoutFn: (() => Promise<void>) | null = null;

export const setLogoutFunction = (fn: () => Promise<void>) => {
  logoutFn = fn;
};

export const triggerLogout = async () => {
  if (logoutFn) {
    await logoutFn();
  }
};
