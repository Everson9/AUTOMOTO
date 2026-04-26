import { NavigatorScreenParams } from '@react-navigation/native';

export type RootTabParamList = {
  Index: undefined;
  Mapa: undefined;
};

export type AuthStackParamList = {
  login: undefined;
  cadastro: undefined;
};

export type MotoStackParamList = {
  'cadastrar-moto': undefined;
};

// Tipos para navegação no Expo Router
export type RootStackParamList = {
  index: undefined;
  '(tabs)': undefined;
  login: undefined;
  cadastro: undefined;
  'cadastrar-moto': undefined;
  modal: undefined;
};