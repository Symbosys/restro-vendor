import React from 'react';
import StackNavigation from './src/navigation/Stack';
import AuthProvider from './src/context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WebSocketProvider } from './src/context/WebSocketContext';

const queryClient = new QueryClient();

const App = () => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthProvider>
            <WebSocketProvider>
              <StackNavigation />
            </WebSocketProvider>
          </AuthProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </>
  );
};

export default App;
