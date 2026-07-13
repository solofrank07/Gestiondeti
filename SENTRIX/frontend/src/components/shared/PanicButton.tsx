import React from 'react';
import { TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { panicService } from '@/services/panicService';
import { useLocationContext } from '@/contexts/LocationContext';

export default function PanicButton() {
  const { location } = useLocationContext();
  const [sending, setSending] = React.useState(false);

  const handlePanic = () => {
    Alert.alert(
      '🔴 ¿Enviar alerta de pánico?',
      'Se notificará a las autoridades con tu ubicación actual.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar alerta',
          style: 'destructive',
          onPress: async () => {
            if (!location) return;
            setSending(true);
            try {
              await panicService.create({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              });
              Alert.alert('Alerta enviada', 'Las autoridades han sido notificadas.');
            } catch {
              Alert.alert('Error', 'No se pudo enviar la alerta.');
            } finally {
              setSending(false);
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      onPress={handlePanic}
      disabled={sending}
      style={{
        backgroundColor: '#c55a11', paddingVertical: 16, borderRadius: 12,
        alignItems: 'center', marginBottom: 40,
        shadowColor: '#c55a11', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
      }}
    >
      {sending ? (
        <ActivityIndicator color="white" />
      ) : (
        <>
          <Text style={{ color: '#ffffff', fontFamily: 'Inter', fontSize: 14, fontWeight: '700', letterSpacing: 1 }}>
            🔴 BOTÓN DE PÁNICO
          </Text>
          <Text style={{ color: '#ffffff', fontFamily: 'Inter', fontSize: 12, marginTop: 4 }}>
            Notifica de inmediato a la Policía
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
