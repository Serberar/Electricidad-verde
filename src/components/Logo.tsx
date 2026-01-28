import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';

const logoSource = require('../assets/logo.png');

type LogoSize = 'small' | 'medium' | 'large';

interface LogoProps {
  size?: LogoSize;
  style?: ViewStyle;
}

const sizes: Record<LogoSize, { width: number; height: number }> = {
  small: { width: 180, height: 45 },
  medium: { width: 240, height: 80 },
  large: { width: 320, height: 107 },
};

export const Logo: React.FC<LogoProps> = ({ size = 'medium', style }) => {
  const dimensions = sizes[size];

  return (
    <View style={[styles.container, style]}>
      <Image
        source={logoSource}
        style={[styles.logo, dimensions]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    // Dimensiones se aplican dinámicamente
  },
});
