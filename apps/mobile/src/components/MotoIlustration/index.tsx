// apps/mobile/src/components/MotoIlustration/index.tsx
//
// Ilustrações SVG de motos por tipo/categoria.
// Usadas na Garagem quando não há foto cadastrada.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';

export type TipoMoto = 'naked' | 'sport' | 'scooter' | 'trail' | 'custom' | 'default';

export interface MotoIlustrationProps {
  tipo: TipoMoto;
  size?: number;
  color?: string;
}

/**
 * Retorna a ilustração SVG correspondente ao tipo de moto.
 * Cor padrão: âmbar (#F97316) sobre fundo escuro.
 */
export function MotoIlustration({ tipo, size = 120, color = '#F97316' }: MotoIlustrationProps) {
  const renderSvg = () => {
    switch (tipo) {
      case 'naked':
        return <NakedMoto color={color} />;
      case 'sport':
        return <SportMoto color={color} />;
      case 'scooter':
        return <ScooterMoto color={color} />;
      case 'trail':
        return <TrailMoto color={color} />;
      case 'custom':
        return <CustomMoto color={color} />;
      default:
        return <DefaultMoto color={color} />;
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        {renderSvg()}
      </Svg>
    </View>
  );
}

// === SVGs por tipo ===

function NakedMoto({ color }: { color: string }) {
  // Moto naked: carenagem frontal pequena, guidão alto
  return (
    <>
      {/* Roda traseira */}
      <Circle cx="88" cy="85" r="18" fill="none" stroke={color} strokeWidth="4" />
      <Circle cx="88" cy="85" r="6" fill={color} />
      {/* Roda dianteira */}
      <Circle cx="32" cy="85" r="18" fill="none" stroke={color} strokeWidth="4" />
      <Circle cx="32" cy="85" r="6" fill={color} />
      {/* Quadro/tanque */}
      <Path
        d="M40 75 L55 45 L70 45 L88 65 L88 75 L40 75"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Guidão */}
      <Path
        d="M45 40 L35 30 M55 40 L45 30"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Banco */}
      <Path
        d="M55 50 L80 50 L80 55 L55 55 Z"
        fill={color}
        opacity="0.3"
      />
      {/* Farol */}
      <Circle cx="33" cy="40" r="5" fill="none" stroke={color} strokeWidth="2" />
    </>
  );
}

function SportMoto({ color }: { color: string }) {
  // Moto sport: carenagem completa, posição inclinada
  return (
    <>
      {/* Roda traseira */}
      <Circle cx="88" cy="85" r="18" fill="none" stroke={color} strokeWidth="4" />
      <Circle cx="88" cy="85" r="6" fill={color} />
      {/* Roda dianteira */}
      <Circle cx="32" cy="85" r="18" fill="none" stroke={color} strokeWidth="4" />
      <Circle cx="32" cy="85" r="6" fill={color} />
      {/* Carenagem */}
      <Path
        d="M20 55 L38 35 L55 32 L88 60 L88 75 L25 75 L20 65 Z"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Guidão baixo */}
      <Path
        d="M42 38 L48 32"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Banco longo */}
      <Path
        d="M45 48 L75 48 L75 55 L45 55 Z"
        fill={color}
        opacity="0.3"
      />
    </>
  );
}

function ScooterMoto({ color }: { color: string }) {
  // Scooter: menor, rodas menores, corpo arredondado
  return (
    <>
      {/* Roda traseira menor */}
      <Circle cx="80" cy="90" r="14" fill="none" stroke={color} strokeWidth="4" />
      <Circle cx="80" cy="90" r="5" fill={color} />
      {/* Roda dianteira menor */}
      <Circle cx="35" cy="90" r="14" fill="none" stroke={color} strokeWidth="4" />
      <Circle cx="35" cy="90" r="5" fill={color} />
      {/* Corpo do scooter */}
      <Path
        d="M25 75 L30 55 L55 45 L85 50 L95 65 L95 80 L25 80 Z"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Assento */}
      <Ellipse cx="60" cy="55" rx="20" ry="8" fill={color} opacity="0.3" />
      {/* Guidão alto */}
      <Path
        d="M45 42 L50 32"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  );
}

function TrailMoto({ color }: { color: string }) {
  // Trail/Adventure: banco alto, guidão alto, roda dianteira maior
  return (
    <>
      {/* Roda traseira */}
      <Circle cx="85" cy="85" r="18" fill="none" stroke={color} strokeWidth="4" />
      <Circle cx="85" cy="85" r="6" fill={color} />
      {/* Roda dianteira (ligeiramente maior) */}
      <Circle cx="30" cy="82" r="20" fill="none" stroke={color} strokeWidth="4" />
      <Circle cx="30" cy="82" r="6" fill={color} />
      {/* Quadro/tanque alto */}
      <Path
        d="M38 70 L50 35 L68 35 L90 60 L90 75 L38 75"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Guidão alto */}
      <Path
        d="M40 30 L28 22 M58 30 L48 22"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Banco longitudinal */}
      <Path
        d="M52 42 L82 50 L80 58 L50 48 Z"
        fill={color}
        opacity="0.3"
      />
      {/* Farol redondo */}
      <Circle cx="22" cy="45" r="6" fill="none" stroke={color} strokeWidth="2" />
    </>
  );
}

function CustomMoto({ color }: { color: string }) {
  // Cruiser/Custom: estilo harley, guidão largo, tanque largo
  return (
    <>
      {/* Roda traseira larga */}
      <Circle cx="88" cy="85" r="18" fill="none" stroke={color} strokeWidth="5" />
      <Circle cx="88" cy="85" r="6" fill={color} />
      {/* Roda dianteira */}
      <Circle cx="30" cy="85" r="18" fill="none" stroke={color} strokeWidth="5" />
      <Circle cx="30" cy="85" r="6" fill={color} />
      {/* Tanque largo */}
      <Path
        d="M35 70 L45 42 L75 42 L95 65 L95 75 L35 75"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Guidão largo */}
      <Path
        d="M42 35 L35 28 M58 35 L52 28"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Banco */}
      <Path
        d="M48 48 L80 55 L78 62 L48 55 Z"
        fill={color}
        opacity="0.3"
      />
      {/* Farol redondo */}
      <Circle cx="25" cy="45" r="6" fill="none" stroke={color} strokeWidth="2" />
    </>
  );
}

function DefaultMoto({ color }: { color: string }) {
  // Silhueta genérica de moto
  return (
    <>
      {/* Roda traseira */}
      <Circle cx="85" cy="85" r="18" fill="none" stroke={color} strokeWidth="4" />
      <Circle cx="85" cy="85" r="6" fill={color} />
      {/* Roda dianteira */}
      <Circle cx="32" cy="85" r="18" fill="none" stroke={color} strokeWidth="4" />
      <Circle cx="32" cy="85" r="6" fill={color} />
      {/* Corpo genérico */}
      <Path
        d="M25 70 L40 42 L65 42 L90 65 L90 75 L30 75 L25 70"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Guidão */}
      <Path
        d="M45 38 L38 30"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Banco */}
      <Path
        d="M50 50 L78 55 L76 62 L48 57 Z"
        fill={color}
        opacity="0.3"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});