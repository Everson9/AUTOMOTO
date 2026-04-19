import { Map, Camera, GeoJSONSource, Layer, TransformRequestManager } from '@maplibre/maplibre-react-native';
import { View, StyleSheet, Text, ActivityIndicator, Alert, TouchableOpacity, Animated } from 'react-native';
import { useEffect, useState, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useMapa, TipoAlerta, AlertaVia } from '../../src/screens/Mapa/useMapa';
import { useHeatmap } from '../../src/hooks/useHeatmap';
import { useClima } from '../../src/hooks/useClima';
import { useDetalheAlerta } from '../../src/hooks/useDetalheAlerta';
import { BotaoAlerta } from '../../src/components/BotaoAlerta';
import { BotaoAssalto } from '../../src/components/BotaoAssalto';
import { SheetAlerta, SheetAlertaRef } from '../../src/components/SheetAlerta';
import { SheetAssalto, SheetAssaltoRef } from '../../src/components/SheetAssalto';
import { SheetDetalheAlerta, SheetDetalheAlertaRef, AlertaDetalhe } from '../../src/components/SheetDetalheAlerta';
import { BannerClima } from '../../src/components/BannerClima';
import { ClimaIconAnimado } from '../../src/components/ClimaIconAnimado';
import { MotoMarker } from '../../src/components/MotoMarker';
import { AlertaMarker } from '../../src/components/AlertaMarker';
import { useAuthContext } from '../../src/hooks/AuthProvider';

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [loading, setLoading] = useState(true);
  const [sheetAberto, setSheetAberto] = useState(false);
  const [avisoClimaTimedOut, setAvisoClimaTimedOut] = useState(false);

  const mapRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const sheetRef = useRef<SheetAlertaRef>(null);
  const sheetAssaltoRef = useRef<SheetAssaltoRef>(null);
  const sheetDetalheRef = useRef<SheetDetalheAlertaRef>(null);

  // Estado para o sheet de detalhes do alerta
  const [alertaSelecionado, setAlertaSelecionado] = useState<AlertaVia | null>(null);
  const [jaVotouEstado, setJaVotouEstado] = useState(false);

  // Hook para confirmar/negar alertas (persiste votos no AsyncStorage)
  const { confirmar: confirmarAlerta, negar: negarAlerta, jaVotou } = useDetalheAlerta();

  const { alertas, alertasGeoJSON, erro: alertasErro, reportarAlerta } = useMapa(location);
  const { heatmapData, erro: heatmapErro, refetch: refetchHeatmap } = useHeatmap(location);
  const {
    deveExibir: deveExibirAvisoClima,
    mensagem: mensagemClima,
    fecharAviso,
    reabrirAviso,
    foiFechado: avisoClimaFechado,
  } = useClima(location);
  const { user } = useAuthContext();

  // Calcular iniciais do usuário para o avatar
  const iniciais = user?.user_metadata?.nome
    ? user.user_metadata.nome
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || '?';

  const handlePerfil = useCallback(() => {
    router.push('/perfil');
  }, []);

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
    setSheetAberto(true);
    sheetRef.current?.expand();
  }, [user, location]);

  const handleReportarAssalto = useCallback(() => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para reportar assaltos.');
      return;
    }
    if (!location) {
      Alert.alert('Erro', 'Localização não disponível. Aguarde um momento.');
      return;
    }
    setSheetAberto(true);
    sheetAssaltoRef.current?.expand();
  }, [user, location]);

  const handleConfirmarAssalto = useCallback(async () => {
    try {
      const mensagem = await reportarAlerta('assalto');
      await refetchHeatmap();
      setSheetAberto(false);
      Alert.alert('Sucesso', mensagem);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao reportar assalto');
    }
  }, [reportarAlerta, refetchHeatmap]);

  const handleSelectTipoAlerta = useCallback(async (tipo: TipoAlerta) => {
    try {
      const mensagem = await reportarAlerta(tipo);
      setSheetAberto(false);
      Alert.alert('Sucesso', mensagem);
      sheetRef.current?.close();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao reportar alerta');
    }
  }, [reportarAlerta]);

  const handleCloseSheetAssalto = useCallback(() => {
    setSheetAberto(false);
    sheetAssaltoRef.current?.close();
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetAberto(false);
    sheetRef.current?.close();
  }, []);

  // Handler para toque em alerta no mapa
  const handleAlertaPress = useCallback(async (alerta: AlertaVia) => {
    setAlertaSelecionado(alerta);
    const votado = await jaVotou(alerta.id);
    setJaVotouEstado(votado);
    setSheetAberto(true);
    // Pequeno delay para garantir que o estado atualizou antes de expandir
    setTimeout(() => sheetDetalheRef.current?.expand(), 100);
  }, [jaVotou]);

  // Handler para confirmar alerta
  const handleConfirmarAlerta = useCallback(async () => {
    if (!alertaSelecionado) return;
    try {
      await confirmarAlerta(alertaSelecionado.id);
      setAlertaSelecionado(null);
    } catch (error) {
      console.error('[handleConfirmarAlerta]', error);
    }
  }, [alertaSelecionado, confirmarAlerta]);

  // Handler para negar alerta
  const handleNegarAlerta = useCallback(async () => {
    if (!alertaSelecionado) return;
    try {
      await negarAlerta(alertaSelecionado.id);
      setAlertaSelecionado(null);
    } catch (error) {
      console.error('[handleNegarAlerta]', error);
    }
  }, [alertaSelecionado, negarAlerta]);

  // Handler para fechar sheet de detalhes
  const handleCloseSheetDetalhe = useCallback(() => {
    setSheetAberto(false);
    setAlertaSelecionado(null);
  }, []);

  // Handlers do aviso de clima
  const handleFecharAvisoClima = useCallback(() => {
    fecharAviso();
    setAvisoClimaTimedOut(false);
  }, [fecharAviso]);

  const handleTimeoutAvisoClima = useCallback(() => {
    setAvisoClimaTimedOut(true);
  }, []);

  const handleReabrirAvisoClima = useCallback(() => {
    setAvisoClimaTimedOut(false);
    reabrirAviso();
  }, [reabrirAviso]);

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
        onDidFinishLoadingMap={() => {}}
        onDidFailLoadingMap={() => {}}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: location
              ? [location.coords.longitude, location.coords.latitude]
              : [-43.172896, -22.906847],
            zoom: 17,
          }}
          minZoom={10}
          maxZoom={22}
          trackUserLocation="course"
        />


        {/* Alertas na via */}
        {alertas.map(alerta => (
          <AlertaMarker
            key={alerta.id}
            id={alerta.id}
            coordinate={[alerta.lng, alerta.lat]}
            tipo={alerta.tipo}
            onPress={() => handleAlertaPress(alerta)}
          />
        ))}

        {/* Heatmap de assaltos */}
        {heatmapData.features.length > 0 && (
          <GeoJSONSource
            id="heatmap-source"
            data={heatmapData}
          >
            <Layer
              id="heatmap-layer"
              type="heatmap"
              filter={['==', ['geometry-type'], 'Point']}
              paint={{
                heatmapColor: [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  0,
                  'rgba(127, 29, 29, 0)',
                  0.2,
                  'rgba(127, 29, 29, 0.3)',
                  0.4,
                  'rgba(220, 38, 38, 0.5)',
                  0.6,
                  'rgba(239, 68, 68, 0.6)',
                  0.8,
                  'rgba(252, 165, 165, 0.7)',
                  1,
                  'rgba(255, 255, 255, 0.9)',
                ],
                heatmapWeight: ['get', 'peso'],
                heatmapIntensity: ['interpolate', ['linear'], ['zoom'], 10, 1, 15, 2],
                heatmapRadius: ['interpolate', ['linear'], ['zoom'], 10, 20, 15, 40],
                heatmapOpacity: 0.8,
              }}
            />
          </GeoJSONSource>
        )}

        {/* Marcador da posição do usuário (ícone da moto) */}
        {locationPermission === 'granted' && location && (
          <MotoMarker
            coordinate={[location.coords.longitude, location.coords.latitude]}
            heading={location.coords.heading ?? 0}
          />
        )}
      </Map>

      <BotaoAlerta onPress={handleReportarAlerta} visivel={!sheetAberto} />
      <BotaoAssalto onPress={handleReportarAssalto} visivel={!sheetAberto} />

      {/* Header direito: ícone de clima + perfil */}
      <View style={styles.headerRight}>
        {/* Ícone de clima (aparece quando aviso foi fechado e ainda há previsão de chuva) */}
        {deveExibirAvisoClima && (avisoClimaFechado || avisoClimaTimedOut) && (
          <TouchableOpacity
            style={styles.climaIconButton}
            onPress={handleReabrirAvisoClima}
            activeOpacity={0.7}
            accessibilityLabel="Reabrir aviso de chuva"
            accessibilityRole="button"
          >
            <ClimaIconAnimado size={20} />
          </TouchableOpacity>
        )}

        {/* Botão de perfil */}
        <TouchableOpacity
          style={styles.perfilButton}
          onPress={handlePerfil}
          activeOpacity={0.7}
        >
          <Text style={styles.perfilButtonText}>{iniciais}</Text>
        </TouchableOpacity>
      </View>

      {/* Banner de aviso de chuva */}
      <BannerClima
        mensagem={mensagemClima}
        visivel={deveExibirAvisoClima && !avisoClimaFechado && !avisoClimaTimedOut}
        onClose={handleFecharAvisoClima}
        onTimeout={handleTimeoutAvisoClima}
      />

      <SheetAlerta
        ref={sheetRef}
        onSelectTipo={handleSelectTipoAlerta}
        onClose={handleCloseSheet}
      />

      <SheetAssalto
        ref={sheetAssaltoRef}
        onConfirm={handleConfirmarAssalto}
        onClose={handleCloseSheetAssalto}
      />

      <SheetDetalheAlerta
        ref={sheetDetalheRef}
        alerta={alertaSelecionado ? {
          id: alertaSelecionado.id,
          tipo: alertaSelecionado.tipo,
          confirmacoes: alertaSelecionado.confirmacoes,
          negacoes: (alertaSelecionado as AlertaVia & { negacoes?: number }).negacoes ?? 0,
          criado_em: alertaSelecionado.expira_em,
        } : null}
        jaVotou={jaVotouEstado}
        onConfirmar={handleConfirmarAlerta}
        onNegar={handleNegarAlerta}
        onClose={handleCloseSheetDetalhe}
      />

      {(alertasErro || heatmapErro || errorMsg) && (
        <View style={styles.errorMessage}>
          <Text>{alertasErro || heatmapErro || errorMsg}</Text>
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
  headerRight: {
    position: 'absolute',
    top: 60,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  climaIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D3748',
    marginRight: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  perfilButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  perfilButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});