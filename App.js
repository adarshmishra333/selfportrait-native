import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import BottomTabs from './src/navigation/BottomTabs';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <BottomTabs />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

