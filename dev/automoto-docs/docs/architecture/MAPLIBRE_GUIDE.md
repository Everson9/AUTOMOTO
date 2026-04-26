# MAPLIBRE_GUIDE.md — Guia de Integração MapLibre

> Para padrões de código de layers: ver `SKILLS.md` seções 3 e 4.
> Este arquivo cobre configuração, troubleshooting e decisões de design do mapa.

---

## Setup

```bash
npx expo install @maplibre/maplibre-react-native expo-dev-client
```

`app.json`:
```json
{
  "expo": {
    "plugins": [
      ["@maplibre/maplibre-react-native", {}]
    ]
  }
}
```

```bash
# Não funciona no Expo Go — requer build nativo
npx expo run:android   # desenvolvimento local
eas build --profile development   # via EAS
```

---

## Estrutura mínima do mapa

```tsx
// apps/mobile/src/components/Mapa/index.tsx
import MapLibreGL from '@maplibre/maplibre-react-native'
import { useRef } from 'react'
import { View, StyleSheet } from 'react-native'

MapLibreGL.setAccessToken(null)  // MapLibre não precisa de token

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty'

export function Mapa({ children }: { children?: React.ReactNode }) {
  const mapRef = useRef<MapLibreGL.MapView>(null)
  const cameraRef = useRef<MapLibreGL.Camera>(null)

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
          followUserLocation
          followUserMode={MapLibreGL.UserTrackingMode.Follow}
          animationMode="flyTo"
          animationDuration={500}
        />

        <MapLibreGL.UserLocation
          visible
          renderMode="native"
          showsUserHeadingIndicator
        />

        {children}
      </MapLibreGL.MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
})
```

---

## Estilos de tiles disponíveis (OpenFreeMap)

| URL                                                    | Visual          | Uso recomendado      |
|--------------------------------------------------------|-----------------|----------------------|
| `https://tiles.openfreemap.org/styles/liberty`         | Colorido limpo  | Padrão               |
| `https://tiles.openfreemap.org/styles/bright`          | Mais vibrante   | Modo dia             |
| `https://tiles.openfreemap.org/styles/positron`        | Claro minimalista | Heatmap (menos ruído visual) |

---

## Permissões de localização

```typescript
// apps/mobile/src/lib/location.ts
import * as Location from 'expo-location'

export async function pedirPermissaoLocalizacao(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync()
  if (status !== 'granted') return false

  // Para Comboio (background): pedir permissão adicional
  const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync()
  return bgStatus === 'granted'
}

export async function obterLocalizacaoAtual() {
  return Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,  // não usar High — drena bateria
  })
}
```

Adicionar ao `app.json`:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Necessário para mostrar alertas próximos e sua posição no mapa.",
        "NSLocationAlwaysUsageDescription": "Necessário para o Modo Comboio funcionar em segundo plano."
      }
    },
    "android": {
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION"
      ]
    }
  }
}
```

---

## Controle imperativo da câmera

```typescript
// Centralizar em coordenada
cameraRef.current?.setCamera({
  centerCoordinate: [lng, lat],
  zoomLevel: 15,
  animationDuration: 800,
})

// Ajustar para mostrar múltiplos pontos (fit bounds)
cameraRef.current?.fitBounds(
  [minLng, minLat],   // SW corner
  [maxLng, maxLat],   // NE corner
  [50, 50, 50, 50],   // padding [top, right, bottom, left]
  500                  // animationDuration
)
```

---

## Performance: clustering de pontos

Para o heatmap de assaltos com muitos pontos, usar clustering nativo:

```tsx
<MapLibreGL.ShapeSource
  id="assaltos"
  shape={geoJson}
  cluster                    // ativar clustering automático
  clusterRadius={50}         // raio em pixels para agrupar
  clusterMaxZoomLevel={14}   // zoom a partir do qual mostra pontos individuais
>
  {/* Layer para clusters */}
  <MapLibreGL.CircleLayer
    id="clusters"
    belowLayerID="cluster-count"
    filter={['has', 'point_count']}
    style={{
      circleColor: ['step', ['get', 'point_count'],
        '#FF5733', 10, '#C70039', 30, '#900C3F'
      ],
      circleRadius: ['step', ['get', 'point_count'],
        20, 10, 30, 30, 40
      ],
      circleOpacity: 0.7,
    }}
  />
  {/* Número dentro do cluster */}
  <MapLibreGL.SymbolLayer
    id="cluster-count"
    filter={['has', 'point_count']}
    style={{
      textField: ['get', 'point_count_abbreviated'],
      textSize: 14,
      textColor: '#FFFFFF',
    }}
  />
  {/* Pontos individuais (zoom alto) */}
  <MapLibreGL.HeatmapLayer
    id="heatmap"
    filter={['!', ['has', 'point_count']]}
    style={{ heatmapRadius: 30, heatmapOpacity: 0.7 }}
  />
</MapLibreGL.ShapeSource>
```

---

## Troubleshooting comum

| Problema                            | Causa                                  | Solução                                      |
|-------------------------------------|----------------------------------------|----------------------------------------------|
| Mapa não carrega no Expo Go         | MapLibre precisa de build nativo       | Usar `expo run:android` ou EAS Dev Client    |
| Tela preta após build               | Plugin não configurado no app.json     | Verificar o plugin `@maplibre/maplibre-react-native` |
| Pins não aparecem                   | GeoJSON malformado                     | Validar em geojson.io antes de usar          |
| Heatmap não renderiza               | Layer abaixo de outro layer opaco      | Verificar ordem das layers e `belowLayerID`  |
| GPS não atualiza                    | Permissão não concedida                | Chamar `pedirPermissaoLocalizacao()` no onboarding |
| Crash ao usar ícones customizados   | ImageRun antes do mapa estar pronto    | Usar o evento `onDidFinishLoadingMap`        |
