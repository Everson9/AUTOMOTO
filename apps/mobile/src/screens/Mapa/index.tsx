import MapLibreGL from '@maplibre/maplibre-react-native';
import { View, StyleSheet, Text, PermissionsAndroid, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

// Configurar URL de acesso (não necessário para MapLibre)
MapLibreGL.setAccessToken(null);

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

export default function MapaScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        // Solicitar permissão de localização
        let { status } = await Location.requestForegroundPermissionsAsync();
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
  }, []);

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        style={styles.map}
        styleURL={STYLE_URL}
        compassEnabled
        logoEnabled={false}
        attributionEnabled={false}
      >
        <MapLibreGL.Camera
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