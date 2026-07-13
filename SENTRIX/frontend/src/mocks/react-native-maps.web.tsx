import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const PROVIDER_GOOGLE = 'google';

export const MapView = React.forwardRef(({ children, style, ...props }: any, ref: any) => {
  return (
    <View ref={ref} style={[styles.map, style]} {...props}>
      <View style={styles.overlay}>
        <Text style={styles.text}>🗺️ Mapa de SENTRIX (Modo Web)</Text>
        <Text style={styles.subtext}>Las funcionalidades de mapa nativo se visualizan aquí.</Text>
      </View>
      {children}
    </View>
  );
});

export const Marker = ({ children, style, ...props }: any) => {
  return (
    <View style={[styles.marker, style]} {...props}>
      <Text style={{ fontSize: 24 }}>📍</Text>
      {children}
    </View>
  );
};

export const Polygon = ({ children, style, ...props }: any) => {
  return <View style={style} {...props}>{children}</View>;
};

export const Circle = ({ children, style, ...props }: any) => {
  return <View style={style} {...props}>{children}</View>;
};

const styles = StyleSheet.create({
  map: {
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 300,
  },
  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  text: {
    color: '#34d399',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  subtext: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
  },
  marker: {
    position: 'absolute',
  },
});

export default MapView;
