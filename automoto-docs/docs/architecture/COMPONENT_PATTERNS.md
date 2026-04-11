# COMPONENT_PATTERNS.md — Padrões de Componentes

> Design tokens, componentes base e padrões visuais do Automoto.
> Sempre usar estes padrões antes de criar estilos novos.

---

## Design Tokens

```typescript
// packages/ui/src/tokens/index.ts

export const colors = {
  brand: {
    primary:   '#1A56DB',   // azul principal — ações, links
    secondary: '#0E9F6E',   // verde — sucesso, confirmações
    danger:    '#E02424',   // vermelho — alertas críticos, urgente
    warning:   '#C27803',   // âmbar — atenção, em progresso
  },
  background: {
    primary:   '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary:  '#F3F4F6',
    dark:      '#111928',
  },
  text: {
    primary:   '#111928',
    secondary: '#6B7280',
    tertiary:  '#9CA3AF',
    inverse:   '#FFFFFF',
  },
  border: {
    light:  '#E5E7EB',
    medium: '#D1D5DB',
    dark:   '#9CA3AF',
  },
  // Cores semânticas de saúde da moto
  saude: {
    ok:      '#0E9F6E',   // < 70% do intervalo consumido
    atencao: '#C27803',   // 70-90%
    urgente: '#E02424',   // > 90%
  },
  // Cores por tipo de alerta da via
  alerta: {
    oleo:     '#FF8C00',
    areia:    '#F5A623',
    buraco:   '#E02424',
    obra:     '#FF6B35',
    enchente: '#1A56DB',
    acidente: '#E02424',
    outro:    '#6B7280',
  },
} as const

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const

export const typography = {
  sizes: {
    xs:   11,
    sm:   13,
    base: 15,
    lg:   17,
    xl:   20,
    xxl:  24,
    xxxl: 30,
  },
  weights: {
    regular: '400' as const,
    medium:  '500' as const,
    bold:    '700' as const,
  },
  lineHeights: {
    tight:  1.25,
    normal: 1.5,
    loose:  1.75,
  },
} as const

export const radii = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
} as const
```

---

## Componentes Base (packages/ui)

### Button

```tsx
interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
}

// Tamanhos:
// sm: height 36, texto 13px — uso interno, sub-ações
// md: height 44, texto 15px — ações normais
// lg: height 56, texto 17px — ações principais, USO COM LUVA
```

### Input

```tsx
interface InputProps {
  label: string
  value: string
  onChangeText: (text: string) => void
  error?: string
  placeholder?: string
  keyboardType?: KeyboardTypeOptions
  maxLength?: number
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
}
// height: 48px, borderRadius: radii.md
// borda vermelha + mensagem abaixo quando error presente
```

### Card

```tsx
interface CardProps {
  children: React.ReactNode
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}
// background: white, borderRadius: radii.lg, shadow.sm
// Se onPress: adicionar ripple/pressed state
```

### Badge de Status

```tsx
type StatusVariant = 'ok' | 'atencao' | 'urgente' | 'info'

// ok      → fundo verde claro, texto verde escuro
// atencao → fundo âmbar claro, texto âmbar escuro
// urgente → fundo vermelho claro, texto vermelho escuro
// info    → fundo azul claro, texto azul escuro
```

### BottomSheet

Usar `@gorhom/bottom-sheet` para todos os sheets do app.

```tsx
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'

const snapPoints = ['25%', '50%']  // altura do sheet
const sheetRef = useRef<BottomSheet>(null)

// Abrir: sheetRef.current?.expand()
// Fechar: sheetRef.current?.close()
```

---

## Padrões de Layout de Telas

### Tela de lista (ex: ManutencaoListScreen)

```
SafeAreaView
  Header (título + botão de ação)
  FlatList (dados)
    ListHeaderComponent: filtros/ordenação
    renderItem: Card específico do domínio
    ListEmptyComponent: EmptyState
    ListFooterComponent: espaçamento bottom
  FAB (Floating Action Button) para adicionar
```

### Tela de formulário (ex: AdicionarModScreen)

```
SafeAreaView
  KeyboardAvoidingView
    ScrollView
      Header (título + botão fechar)
      Seções do formulário
      Botão submit (fixo no bottom)
```

### Tela de mapa (ex: RadarScreen)

```
View (flex: 1)
  Mapa (flex: 1, ocupa tudo)
  Overlay superior (busca, filtros) — position absolute
  Overlay inferior (FAB de reporte) — position absolute
  BottomSheet (detalhes ao tocar)
```

---

## Empty States

Todo empty state deve ter:
1. Ícone ilustrativo (não emoji)
2. Título em 1 linha
3. Subtítulo explicativo em 1-2 linhas
4. CTA quando fizer sentido

```tsx
// Exemplos por tela:
// Garagem sem moto:
//   Título: "Nenhuma moto cadastrada"
//   Sub: "Adicione sua moto para começar a usar o Automoto"
//   CTA: "Cadastrar moto"

// Manutenção sem registros:
//   Título: "Histórico vazio"
//   Sub: "Registre sua primeira manutenção para começar a monitorar a saúde da moto"
//   CTA: "Adicionar manutenção"
```

---

## Loading States

- **Listas**: skeleton screens (não spinner centralizado)
- **Botões**: `loading` prop desabilita e mostra ActivityIndicator dentro do botão
- **Tela inteira**: tela de loading dedicada com logo (apenas no primeiro carregamento)
- **Inline**: `ActivityIndicator` pequeno ao lado do conteúdo
