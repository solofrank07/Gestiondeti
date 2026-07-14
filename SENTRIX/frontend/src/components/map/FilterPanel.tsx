import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Calendar } from '@/components/shared/Icons';

const CRIME_TYPES = ['Hurto', 'Robo agravado', 'Extorsión', 'Sicariato', 'Todos'];
const HOUR_RANGES = ['Mañana', 'Tarde', 'Noche', 'Madrugada'];

interface FilterPanelProps {
  visible: boolean;
  onClose: () => void;
}

export default function FilterPanel({ visible, onClose }: FilterPanelProps) {
  const [selectedCrimes, setSelectedCrimes] = useState<string[]>(['Todos']);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const toggleCrime = (crime: string) => {
    if (crime === 'Todos') {
      setSelectedCrimes(['Todos']);
      return;
    }
    const next = selectedCrimes.filter((c) => c !== 'Todos');
    if (next.includes(crime)) {
      setSelectedCrimes(next.filter((c) => c !== crime));
    } else {
      setSelectedCrimes([...next, crime]);
    }
  };

  const handleApply = () => {
    // Apply filters
    onClose();
  };

  const handleClear = () => {
    setSelectedCrimes(['Todos']);
    setSelectedHour(null);
    setFromDate('');
    setToDate('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
        <View style={{
          backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
          paddingBottom: 40, maxHeight: '80%',
        }}>
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', fontFamily: 'Inter', color: '#191c1e' }}>Filtrar mapa</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ fontSize: 24, color: '#747780' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Crime type */}
            <Text style={{ fontSize: 14, fontWeight: '600', fontFamily: 'Inter', color: '#191c1e', marginBottom: 12 }}>
              Tipo de delito
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {CRIME_TYPES.map((crime) => {
                const active = selectedCrimes.includes(crime) || (crime === 'Todos' && selectedCrimes.length === 0);
                return (
                  <TouchableOpacity
                    key={crime}
                    onPress={() => toggleCrime(crime)}
                    style={{
                      paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
                      backgroundColor: active ? '#03224d' : '#f7f9fc',
                      borderWidth: 1, borderColor: active ? '#03224d' : '#e0e3e6',
                    }}
                  >
                    <Text style={{
                      fontFamily: 'Inter', fontSize: 13, fontWeight: '500',
                      color: active ? '#ffffff' : '#44474f',
                    }}>{crime}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Hour range */}
            <Text style={{ fontSize: 14, fontWeight: '600', fontFamily: 'Inter', color: '#191c1e', marginBottom: 12 }}>
              Rango horario
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {HOUR_RANGES.map((hour) => (
                <TouchableOpacity
                  key={hour}
                  onPress={() => setSelectedHour(selectedHour === hour ? null : hour)}
                  style={{
                    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20,
                    backgroundColor: selectedHour === hour ? '#03224d' : '#f7f9fc',
                    borderWidth: 1, borderColor: selectedHour === hour ? '#03224d' : '#e0e3e6',
                  }}
                >
                  <Text style={{
                    fontFamily: 'Inter', fontSize: 13, fontWeight: '500',
                    color: selectedHour === hour ? '#ffffff' : '#44474f',
                  }}>{hour}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Period */}
            <Text style={{ fontSize: 14, fontWeight: '600', fontFamily: 'Inter', color: '#191c1e', marginBottom: 12 }}>
              Período
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Inter', fontSize: 12, color: '#747780', marginBottom: 4 }}>Desde</Text>
                <TouchableOpacity style={{ backgroundColor: '#f7f9fc', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e0e3e6' }}>
                  <Calendar size={16} color="#747780" /><Text style={{ fontFamily: 'Inter', fontSize: 14, color: '#747780' }}> Seleccionar</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Inter', fontSize: 12, color: '#747780', marginBottom: 4 }}>Hasta</Text>
                <TouchableOpacity style={{ backgroundColor: '#f7f9fc', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e0e3e6' }}>
                  <Calendar size={16} color="#747780" /><Text style={{ fontFamily: 'Inter', fontSize: 14, color: '#747780' }}> Seleccionar</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Actions */}
            <TouchableOpacity onPress={handleClear} style={{ alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 14, color: '#747780' }}>Limpiar filtros</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              style={{ backgroundColor: '#03224d', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#ffffff', fontFamily: 'Inter', fontSize: 16, fontWeight: '600' }}>Aplicar filtros</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
