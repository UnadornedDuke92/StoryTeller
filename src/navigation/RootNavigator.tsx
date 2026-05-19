import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import StoriesScreen from '../screens/StoriesScreen';
import OptionsScreen from '../screens/OptionsScreen';
import ARScreen from '../screens/ARScreen';
import ARMarkerScreen from '../screens/ARMarkerScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  AR: undefined;
  ARMarker: undefined;
};

type TabParamList = {
  Home: undefined;
  Stories: undefined;
  Options: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = { Home: '⬡', Stories: '◎', Options: '⚙' };
  return (
    <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>
      {icons[label] ?? '●'}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#0a0a1a' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
        tabBarStyle: tabStyles.bar,
        tabBarActiveTintColor: '#4488FF',
        tabBarInactiveTintColor: '#556688',
        tabBarLabelStyle: tabStyles.label,
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'StoryTeller' }} />
      <Tab.Screen name="Stories" component={StoriesScreen} />
      <Tab.Screen name="Options" component={OptionsScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="AR"
        component={ARScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="ARMarker"
        component={ARMarkerScreen}
        options={{ animation: 'fade' }}
      />
    </Stack.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    backgroundColor: '#0d0d22',
    borderTopColor: '#1a1a3a',
    borderTopWidth: 1,
    paddingTop: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  icon: {
    fontSize: 20,
    color: '#556688',
  },
  iconFocused: {
    color: '#4488FF',
  },
});
