// apps/mobile/src/screens/Onboarding/OnboardingScreen.tsx
//
// Tutorial de primeira abertura com slides deslizantes.
// Exibido apenas na primeira vez após login.

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const CHAVE_ONBOARDING = 'onboarding_concluido';

// Dados dos slides
interface SlideData {
  type: 'welcome' | 'feature';
  logo?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle?: string;
  description?: string;
}

const SLIDES: SlideData[] = [
  {
    type: 'welcome',
    logo: true,
    title: 'Bem-vindo ao Automoto',
    subtitle: 'Seu companheiro de rota para motociclistas urbanos',
  },
  {
    type: 'feature',
    icon: 'map-marker-alert',
    title: 'Radar da Via',
    description:
      'Veja alertas em tempo real reportados por outros motociclistas. Buracos, óleo, obras e muito mais.',
  },
  {
    type: 'feature',
    icon: 'alert-plus',
    title: 'Reporte e ajude',
    description:
      "Encontrou um perigo na pista? Toque em 'Alerta' no mapa e avise a comunidade em 2 toques.",
  },
  {
    type: 'feature',
    icon: 'garage',
    title: 'Sua Garagem',
    description:
      'Cadastre sua moto, registre customizações e gere o Dossiê de Procedência para venda.',
  },
  {
    type: 'feature',
    icon: 'bell-alert',
    title: 'Alertas de proximidade',
    description:
      'Receba notificações quando se aproximar de alertas na pista. Fique sempre um passo à frente.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Marcar onboarding como concluído e navegar para Home
  const concluirOnboarding = async () => {
    try {
      await AsyncStorage.setItem(CHAVE_ONBOARDING, 'true');
    } catch (error) {
      console.error('[OnboardingScreen] Erro ao salvar AsyncStorage:', error);
    }
    router.replace('/(tabs)');
  };

  // Ir para próximo slide
  const proximoSlide = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  // Renderizar cada slide
  const renderSlide = ({ item }: { item: SlideData }) => {
    if (item.type === 'welcome' && item.logo) {
      return (
        <View style={styles.slideContainer}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
      );
    }

    return (
      <View style={styles.slideContainer}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={item.icon!}
            size={80}
            color="#F97316"
          />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  // Renderizar dots de paginação
  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {SLIDES.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentIndex ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );

  const isUltimoSlide = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Botão Pular - exceto no último slide */}
      {!isUltimoSlide && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={concluirOnboarding}
          activeOpacity={0.7}
          accessibilityLabel="Pular tutorial"
          accessibilityRole="button"
        >
          <Text style={styles.skipText}>Pular</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* Dots de paginação */}
      {renderDots()}

      {/* Botão de ação */}
      <View style={styles.buttonContainer}>
        {isUltimoSlide ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={concluirOnboarding}
            activeOpacity={0.8}
            accessibilityLabel="Começar a usar o app"
            accessibilityRole="button"
          >
            <Text style={styles.startButtonText}>Começar!</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={proximoSlide}
            activeOpacity={0.8}
            accessibilityLabel="Próximo slide"
            accessibilityRole="button"
          >
            <Text style={styles.nextButtonText}>Próximo</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  skipButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
  },
  slideContainer: {
    width: width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#F97316',
  },
  dotInactive: {
    backgroundColor: '#4B5563',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nextButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F97316',
  },
  startButton: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});