import React from 'react';
import { Marker, Polygon, Circle } from '@/components/map/MapView';
import { RiskZone } from '@/types/map';
import { View, Text } from 'react-native';

interface Props {
  zone: RiskZone;
}

export default function RiskZonePolygon({ zone }: Props) {
  if (zone.polygons && zone.polygons.length > 0) {
    return (
      <>
        {zone.polygons.map((polygon, idx) => (
          <Polygon
            key={`${zone.id}-${idx}`}
            coordinates={polygon.points.map((p) => ({ latitude: p.lat, longitude: p.lng }))}
            fillColor={polygon.fill_color || `${zone.color}40`}
            strokeColor={zone.color}
            strokeWidth={polygon.stroke_width || 2}
          />
        ))}
        <Marker
          coordinate={{ latitude: zone.latitude, longitude: zone.longitude }}
          title={zone.name}
          description={`Riesgo: ${zone.risk_score.toFixed(0)}/100`}
        >
          <View className="px-2 py-1 rounded-full" style={{ backgroundColor: zone.color }}>
            <Text className="text-white text-xs font-bold">{zone.risk_score.toFixed(0)}</Text>
          </View>
        </Marker>
      </>
    );
  }

  return (
    <>
      <Circle
        center={{ latitude: zone.latitude, longitude: zone.longitude }}
        radius={zone.radius || 500}
        fillColor={`${zone.color}30`}
        strokeColor={zone.color}
        strokeWidth={2}
      />
      <Marker
        coordinate={{ latitude: zone.latitude, longitude: zone.longitude }}
        title={zone.name}
        description={`Riesgo: ${zone.risk_score.toFixed(0)}/100`}
      >
        <View className="px-2 py-1 rounded-full" style={{ backgroundColor: zone.color }}>
          <Text className="text-white text-xs font-bold">{zone.risk_score.toFixed(0)}</Text>
        </View>
      </Marker>
    </>
  );
}
