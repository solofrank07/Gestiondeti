import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/constants/colors';

const { width } = Dimensions.get('window');

const slides = [
  {
    icon: '🛡️',
    title: 'Conoce tu ciudad, cuida tu camino',
    desc: 'Visualiza zonas de riesgo en tiempo real, sin necesidad de registrarte',
  },
  {
    icon: '🔥',
    title: 'Mapas de calor actualizados',
    desc: 'Filtra por tipo de delito y horario para tomar mejores decisiones.',
  },
  {
    icon: '🔔',
    title: 'Reporta y recibe alertas',
    desc: 'Registra incidentes y recibe notificaciones al acercarte a una zona de riesgo.',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      finish();
    }
  };

  const finish = async () => {
    await AsyncStorage.setItem('sentrix-onboarding-done', 'true');
    router.replace('/(auth)/login');
  };

  const onScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(idx);
  };

  const renderSlide = ({ item }: any) => (
    <View style={{ width, paddingHorizontal: 32, paddingTop: 80 }}>
      <Text style={{ fontSize: 80, textAlign: 'center', marginBottom: 24 }}>{item.icon}</Text>
      <Text style={{
        fontSize: 24,
        fontWeight: '700',
        fontFamily: 'Inter',
        color: '#03224d',
        textAlign: 'center',
        lineHeight: 32,
        marginBottom: 12,
      }}>{item.title}</Text>
      <Text style={{
        fontSize: 15,
        fontFamily: 'Inter',
        color: '#44474f',
        textAlign: 'center',
        lineHeight: 22,
      }}>{item.desc}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f9fc' }}>
      {/* Skip */}
      <TouchableOpacity
        onPress={finish}
        style={{ position: 'absolute', top: 60, right: 20, zIndex: 10 }}
      >
        <Text style={{ fontFamily: 'Inter', fontSize: 14, color: '#747780', fontWeight: '500' }}>Omitir</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        scrollEnabled
      />

      {/* Dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === currentIndex ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === currentIndex ? '#03224d' : '#c4c6d0',
            }}
          />
        ))}
      </View>

      {/* Bottom */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 40, gap: 12 }}>
        <TouchableOpacity
          onPress={handleNext}
          style={{
            backgroundColor: '#03224d',
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#ffffff', fontFamily: 'Inter', fontSize: 16, fontWeight: '600' }}>
            {currentIndex < slides.length - 1 ? 'Siguiente' : 'Comenzar'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={finish} style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Inter', fontSize: 14, color: '#747780' }}>Omitir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
