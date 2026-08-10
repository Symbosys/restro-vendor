import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import StackNavigation from './src/navigation/Stack';
import AuthProvider from './src/context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WebSocketProvider } from './src/context/WebSocketContext';
import { initNotificationListeners } from './src/screen/splash/notification';

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const cleanup = initNotificationListeners();
    return cleanup;
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#8719C6" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#8719C6' }}>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
              <WebSocketProvider>
                <StackNavigation />
              </WebSocketProvider>
            </AuthProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default App;
