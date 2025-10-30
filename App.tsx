
import React from 'react'
import StackNavigation from './src/navigation/Stack'
import AuthProvider from './src/context/AuthContext'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const App = () => {
  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StackNavigation /> 
        </AuthProvider>
      </GestureHandlerRootView>
    </>
  )
}

export default App





