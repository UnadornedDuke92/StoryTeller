import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { SettingsProvider } from './src/context/SettingsContext';

export default function App() {
  return (
    <SettingsProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SettingsProvider>
  );
}
