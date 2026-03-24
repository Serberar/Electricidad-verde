import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';

const logoSource = require('../assets/logo.png');

type LogoSize = 'small' | 'medium' | 'large';

interface LogoProps {
  size?: LogoSize;
  style?: ViewStyle;
}

const sizes: Record<LogoSize, { width: number; height: number }> = {
  small: { width: 100, height: 100 },
  medium: { width: 150, height: 150 },
  large: { width: 200, height: 200 },
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
    margin: 0,
    padding: 0,
  },
  logo: {
    // Dimensiones se aplican dinámicamente
  },
});
