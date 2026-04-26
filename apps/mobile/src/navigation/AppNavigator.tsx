import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapaScreen from '../screens/Mapa'; // Importando a tela do mapa que já tínhamos
import { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Mapa"
      screenOptions={{
        tabBarActiveTintColor: '#1A56DB',
        headerShown: false
      }}
    >
      <Tab.Screen name="Index" component={MapaScreen} />
      <Tab.Screen name="Mapa" component={MapaScreen} />
    </Tab.Navigator>
  );
}