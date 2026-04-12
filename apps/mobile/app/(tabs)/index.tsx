import { Map, Camera, UserLocation, GeoJSONSource, Layer, Marker, TransformRequestManager } from '@maplibre/maplibre-react-native';
import { View, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import { useEffect, useState, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { useMapa, TipoAlerta } from '../../src/screens/Mapa/useMapa';
import { BotaoAlerta } from '../../src/components/BotaoAlerta';
import { SheetAlerta, SheetAlertaRef } from '../../src/components/SheetAlerta';
import { useAuthContext } from '../../src/hooks/AuthProvider';

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [loading, setLoading] = useState(true);

  const mapRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const sheetRef = useRef<SheetAlertaRef>(null);

  const { alertas, erro: alertasErro, reportarAlerta } = useMapa(location);
  const { user } = useAuthContext();

  useEffect(() => {
    TransformRequestManager.addUrlTransform({
      id: 'fix-openfreemap-fonts',
      match: 'tiles\\.openfreemap\\.org/fonts',
      find: 'https://tiles\\.openfreemap\\.org/fonts',
      replace: 'https://demotiles.maplibre.org/font',
    });
  }, []);

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
      Alert.alert('Erro', 'Localização não disponível. Aguarde um momento.');
      return;
    }
    sheetRef.current?.expand();
  }, [user, location]);

  const handleSelectTipoAlerta = useCallback(async (tipo: TipoAlerta) => {
    try {
      await reportarAlerta(tipo);
      Alert.alert('Sucesso', 'Alerta reportado com sucesso!');
      sheetRef.current?.close();
    } catch (error: any) {
      console.error('[handleSelectTipoAlerta]', error);
      Alert.alert('Erro', error.message || 'Erro ao reportar alerta');
    }
  }, [reportarAlerta]);

  const handleCloseSheet = useCallback(() => {
    sheetRef.current?.close();
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
      <Map
        ref={mapRef}
        style={styles.map}
        mapStyle={STYLE_URL}
        compass={true}
        compassPosition={{ top: 100, right: 16 }}
        logo={false}
        attribution={false}
        onDidFinishLoadingMap={() => console.log('[Mapa] carregou com sucesso')}
        onDidFailLoadingMap={() => console.log('[Mapa] ERRO ao carregar')}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: location
              ? [location.coords.longitude, location.coords.latitude]
              : [-43.172896, -22.906847],
            zoom: 15,
            
          }}
          trackUserLocation="course"
        />


        {alertas.length > 0 && (
          <GeoJSONSource
            id="alertas-source"
            data={{
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
            }}
          >
            <Layer
              id="alertas-layer"
              type="symbol"
              paint={{}}
              layout={{
                'icon-image': ['get', 'tipo'],
                'icon-size': 1.0,
                'icon-allow-overlap': true,
                'text-field': ['get', 'confirmacoes'],
                'text-size': 12,
                'text-offset': [0, 0.8],
                'text-anchor': 'top',
              }}
            />
          </GeoJSONSource>
        )}

        {locationPermission === 'granted' && (
          <UserLocation
            animated={true}
            accuracy={false}
            heading={true}
          />
        )}
      </Map>

      <BotaoAlerta onPress={handleReportarAlerta} />

      <SheetAlerta
        ref={sheetRef}
        onSelectTipo={handleSelectTipoAlerta}
        onClose={handleCloseSheet}
      />

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