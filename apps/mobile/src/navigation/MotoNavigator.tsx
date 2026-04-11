import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CadastrarMotoScreen from '../screens/CadastrarMoto';
import { MotoStackParamList } from './types';

const Stack = createStackNavigator<MotoStackParamList>();

export default function MotoNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="CadastrarMoto"
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="CadastrarMoto" component={CadastrarMotoScreen} />
    </Stack.Navigator>
  );
}