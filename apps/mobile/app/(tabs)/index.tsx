import MapLibreGL from '@maplibre/maplibre-react-native';
import { View, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import { useEffect, useState, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { useMapa, TipoAlerta } from '../../src/screens/Mapa/useMapa';
import { BotaoAlerta } from '../../src/components/BotaoAlerta';
import { SheetAlerta, SheetAlertaRef } from '../../src/components/SheetAlerta';
import { useAuthContext } from '../../src/hooks/AuthProvider';

MapLibreGL.setAccessToken(null);

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [loading, setLoading] = useState(true);
  const [showSheet, setShowSheet] = useState(false);

  const mapRef = useRef<MapLibreGL.MapView>(null);
  const cameraRef = useRef<MapLibreGL.Camera>(null);
  const sheetRef = useRef<SheetAlertaRef>(null);

  const { alertas, isLoading: alertasLoading, erro: alertasErro, reportarAlerta } = useMapa(location);

  const { user } = useAuthContext();

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status);

        if (status !== 'granted') {
          setErrorMsg('Permissão de localização negada');
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(currentLocation);
      } catch (error) {
        setErrorMsg(`Erro ao obter localização: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    requestLocationPermission();
  }, []);

  const handleReportarAlerta = useCallback(() => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para reportar alertas.');
      return;
    }

    if (!location) {
      Alert.alert('Erro', 'Localização não disponível. Aguarde um momento e tente novamente.');
      return;
    }

    setShowSheet(true);
    setTimeout(() => {
      sheetRef.current?.expand();
    }, 100);
  }, [user, location]);

  const handleSelectTipoAlerta = useCallback(async (tipo: TipoAlerta) => {
    try {
      await reportarAlerta(tipo);
      Alert.alert('Sucesso', 'Alerta reportado com sucesso!');
      sheetRef.current?.close();
      setShowSheet(false);
    } catch (error: any) {
      console.error('[handleSelectTipoAlerta]', error);
      Alert.alert('Erro', error.message || 'Erro ao reportar alerta');
    }
  }, [reportarAlerta]);

  const handleCloseSheet = useCallback(() => {
    sheetRef.current?.close();
    setShowSheet(false);
  }, []);

  if (loading) {
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
              : [-43.172896, -22.906847]
          }
          animationMode="flyTo"
          animationDuration={2000}
        />

        {location && (
          <MapLibreGL.PointAnnotation
            id="current-location-pin"
            coordinate={[location.coords.longitude, location.coords.latitude]}
          >
            <View style={styles.pin}>
              <Text style={styles.pinText}>📍</Text>
            </View>
          </MapLibreGL.PointAnnotation>
        )}

        {/* Camada de alertas no mapa */}
        {alertas.length > 0 && (
          <MapLibreGL.ShapeSource id="alertas-source" shape={{
            type: 'FeatureCollection',
            features: alertas.map(alerta => ({
              type: 'Feature',
              id: alerta.id,
              geometry: {
                type: 'Point',
                coordinates: [alerta.lng, alerta.lat],
              },
              properties: {
                id: alerta.id,
                tipo: alerta.tipo,
                confirmacoes: alerta.confirmacoes,
              },
            })),
          }}>
            <MapLibreGL.SymbolLayer
              id="alertas-layer"
              style={{
                iconImage: ['get', 'tipo'],
                iconSize: 1.0,
                iconAllowOverlap: true,
                iconIgnorePlacement: true,
                textField: ['get', 'confirmacoes'],
                textSize: 12,
                textOffset: [0, 0.8],
                textAnchor: 'top',
              }}
            />
          </MapLibreGL.ShapeSource>
        )}

        {locationPermission === 'granted' && (
          <MapLibreGL.UserLocation
            visible
            renderMode="native"
            showsUserHeadingIndicator
          />
        )}
      </MapLibreGL.MapView>

      {/* Botão flutuante para reportar alerta */}
      <BotaoAlerta onPress={handleReportarAlerta} />

      {showSheet && (
        <SheetAlerta
          ref={sheetRef}
          onSelectTipo={handleSelectTipoAlerta}
          onClose={handleCloseSheet}
        />
      )}

      {(alertasErro || errorMsg) && (
        <View style={styles.errorMessage}>
          <Text>{alertasErro || errorMsg}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pinText: { fontSize: 20 },
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