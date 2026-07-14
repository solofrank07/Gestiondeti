import React, { useRef, useCallback } from 'react';
import { View, Platform, PanResponder, type GestureResponderEvent, type PanResponderGestureState } from 'react-native';

interface Props {
  value: number;
  min: number;
  max: number;
  step: number;
  onValueChange: (v: number) => void;
}

export default function Slider({ value, min, max, step, onValueChange }: Props) {
  const trackRef = useRef<View>(null);
  const trackWidth = useRef(0);

  const clamp = (v: number) => {
    const stepped = Math.round((v - min) / step) * step + min;
    return Math.min(max, Math.max(min, stepped));
  };

  const getValueFromX = useCallback((x: number) => {
    const ratio = trackWidth.current > 0 ? x / trackWidth.current : 0;
    return clamp(min + ratio * (max - min));
  }, [min, max, step]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const x = evt.nativeEvent.locationX;
        onValueChange(getValueFromX(x));
      },
      onPanResponderMove: (evt: GestureResponderEvent, _gs: PanResponderGestureState) => {
        const x = evt.nativeEvent.locationX;
        onValueChange(getValueFromX(x));
      },
    })
  ).current;

  const fraction = (value - min) / (max - min);

  // Web: use native HTML range
  if (Platform.OS === 'web') {
    return (
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onValueChange(Number(e.target.value))}
        style={{ width: '100%', height: 40, cursor: 'pointer', accentColor: '#03224d' }}
      />
    );
  }

  // Native: custom view-based slider
  return (
    <View
      ref={trackRef}
      onLayout={() => {
        trackRef.current?.measure((_x, _y, w) => { trackWidth.current = w; });
      }}
      style={{ height: 40, justifyContent: 'center' }}
      {...panResponder.panHandlers}
    >
      {/* Track background */}
      <View style={{ height: 6, borderRadius: 3, backgroundColor: '#e0e3e6', overflow: 'hidden' }}>
        <View style={{ width: `${fraction * 100}%`, height: 6, backgroundColor: '#03224d' }} />
      </View>
      {/* Thumb */}
      <View
        style={{
          position: 'absolute', left: `${fraction * 100}%`, marginLeft: -12,
          width: 24, height: 24, borderRadius: 12, backgroundColor: '#03224d',
          shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 3,
        }}
      />
    </View>
  );
}
