import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import VerifyScreen from './src/screens/VerifyScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PlaceholderScreen from './src/screens/PlaceholderScreen';

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#101020',
    card: '#19192B',
    text: '#FFFFFF',
    border: '#292941',
    primary: '#A78BFA',
  },
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const icons: Record<string, string> = {
  Home: '⌂', Discover: '⌕', Live: '◉', Messages: '✉', Profile: '♙',
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#A78BFA',
        tabBarInactiveTintColor: '#77778F',
        tabBarStyle: { backgroundColor: '#19192B', borderTopColor: '#292941' },
        tabBarIcon: ({ color }) => (
          <Text style={{ color: route.name === 'Live' ? '#FF5277' : color, fontSize: 22 }}>
            {icons[route.name]}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={PlaceholderScreen} />
      <Tab.Screen name="Live" component={PlaceholderScreen} />
      <Tab.Screen name="Messages" component={PlaceholderScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function Root() {
  const { user, loading, refreshUser } = useAuth();
  React.useEffect(() => { if (user && user.isVerified === undefined) refreshUser(); }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#101020', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#A78BFA" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={theme}>
      {user && user.isVerified ? (
        <Tabs />
      ) : user ? (
        <VerifyScreen />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Root />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
