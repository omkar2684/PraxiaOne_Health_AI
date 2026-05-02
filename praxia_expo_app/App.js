import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegistrationScreen from './src/screens/RegistrationScreen';
import DataSourcesScreen from './src/screens/DataSourcesScreen';
import ConnectDataScreen from './src/screens/ConnectDataScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AssistantScreen from './src/screens/AssistantScreen';
import PredictionScreen from './src/screens/PredictionScreen';
import RecommendationScreen from './src/screens/RecommendationScreen';
import EscalationScreen from './src/screens/EscalationScreen';
import MessagePortalScreen from './src/screens/MessagePortalScreen';
import ChatDetailScreen from './src/screens/ChatDetailScreen';
import JourneyFlowScreen from './src/screens/JourneyFlowScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TrackProgressScreen from './src/screens/TrackProgressScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Registration" component={RegistrationScreen} />
        <Stack.Screen name="DataSources" component={DataSourcesScreen} />
        <Stack.Screen name="ConnectData" component={ConnectDataScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Assistant" component={AssistantScreen} />
        <Stack.Screen name="Prediction" component={PredictionScreen} />
        <Stack.Screen name="Recommendation" component={RecommendationScreen} />
        <Stack.Screen name="Escalation" component={EscalationScreen} />
        <Stack.Screen name="MessagePortal" component={MessagePortalScreen} />
        <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
        <Stack.Screen name="JourneyFlow" component={JourneyFlowScreen} />
        <Stack.Screen name="TrackProgress" component={TrackProgressScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
