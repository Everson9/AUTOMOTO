import MapLibreGL from '@maplibre/maplibre-react-native';
import { View, StyleSheet, Text, PermissionsAndroid, Platform, Alert, ActivityIndicator } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../src/hooks/AuthProvider';
import { supabase } from '../../src/lib/supabase';

// Configurar URL de acesso (não necessário para MapLibre)
MapLibreGL.setAccessToken(null);

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [checkingMoto, setCheckingMoto] = useState(true);

  const mapRef = useRef<MapLibreGL.MapView>(null);
  const cameraRef = useRef<MapLibreGL.Camera>(null);
  const router = useRouter();
  const { user, isAutenticado, isLoading } = useAuthContext();

  useEffect(() => {
    const initializeApp = async () => {
      if (isAutenticado && user) {
        // Verificar se o usuário tem moto cadastrada
        const { data, error } = await supabase
          .from('motos')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const hasMoto = (data?.count ?? 0) > 0;

        if (!hasMoto) {
          // Se não tiver moto cadastrada, redirecionar para cadastro
          router.replace('/cadastrar-moto');
          return;
        }
      }

      setCheckingMoto(false);

      // Continuar com a lógica de localização
      const requestLocationPermission = async () => {
        try {
          // Solicitar permissão de localização
          let { status } = await Location.requestForegroundPermissionsAsync();
          setLocationPermission(status);

          if (status !== 'granted') {
            setErrorMsg('Permissão de localização negada');
            return;
          }

          // Obter localização atual
          let currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          setLocation(currentLocation);
        } catch (error) {
          setErrorMsg(`Erro ao obter localização: ${error}`);
        }
      };

      requestLocationPermission();
    };

    if (!isLoading) {
      initializeApp();
    }
  }, [isAutenticado, user, isLoading, router]);

  // Mostrar loading enquanto verifica se o usuário tem moto
  if (checkingMoto || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A56DB" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={STYLE_URL}
        compassEnabled
        compassViewMargins={{ x: 16, y: 100 }}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <MapLibreGL.Camera
          ref={cameraRef}
          zoomLevel={14}
          centerCoordinate={
            location
              ? [location.coords.longitude, location.coords.latitude]
              : [-43.172896, -22.906847] // Coordenadas padrão (Rio de Janeiro)
          }
          animationMode="flyTo"
          animationDuration={2000}
        />

        {location && (
          <MapLibreGL.PointAnnotation
            id="current-location-pin"
            coordinate={[
              location.coords.longitude,
              location.coords.latitude
            ]}
          >
            <View style={styles.pin}>
              <Text style={styles.pinText}>📍</Text>
            </View>
          </MapLibreGL.PointAnnotation>
        )}

        {/* Camada de localização do usuário */}
        {locationPermission === 'granted' && (
          <MapLibreGL.UserLocation
            visible
            renderMode="native"
            showsUserHeadingIndicator
          />
        )}
      </MapLibreGL.MapView>

      {errorMsg && (
        <View style={styles.errorMessage}>
          <Text>{errorMsg}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pin: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pinText: {
    fontSize: 20,
  },
  errorMessage: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
});
