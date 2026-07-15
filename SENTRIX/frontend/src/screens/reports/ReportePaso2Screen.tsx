import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useReportStore } from '@/store/reportStore';
import { goBack } from '@/utils/navigation';
import { useCrimeTypes } from '@/hooks/useCrimeTypes';

export default function ReportePaso2Screen() {
  const { draft, setCrimeType, setDescription, setIncidentDate } = useReportStore();
  const [selected, setSelected] = useState(draft.crimeType || '');
  const [desc, setDesc] = useState(draft.description || '');
  const [date, setDate] = useState(draft.incidentDate || new Date().toISOString().split('T')[0]);
  const { data: crimeTypes, isLoading } = useCrimeTypes();

  const handleSelect = (id: string) => {
    setSelected(id);
    setCrimeType(id);
  };

  const handleContinue = () => {
    if (!selected) return;
    if (!desc.trim()) {
      Alert.alert('Descripción requerida', 'Por favor describe brevemente lo ocurrido.');
      return;
    }
    setDescription(desc);
    setIncidentDate(date);
    router.push('/(report)/confirmar');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f7f9fc' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 }}>
        <TouchableOpacity onPress={() => goBack('/(report)/paso1')}>
          <Text style={{ fontSize: 24, color: '#191c1e' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 18, fontWeight: '700', fontFamily: 'Inter', color: '#03224d', textAlign: 'center', marginRight: 24 }}>
          Clasificar incidente
        </Text>
      </View>

      {/* Step indicator */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        <View style={{ width: 32, height: 4, borderRadius: 2, backgroundColor: '#03224d' }} />
        <View style={{ width: 32, height: 4, borderRadius: 2, backgroundColor: '#03224d' }} />
        <View style={{ width: 32, height: 4, borderRadius: 2, backgroundColor: '#c4c6d0' }} />
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', fontFamily: 'Inter', color: '#191c1e', marginBottom: 16 }}>
          ¿Qué tipo de incidente ocurrió?
        </Text>

        {/* Crime type options */}
        {isLoading ? (
          <ActivityIndicator size="small" color="#03224d" />
        ) : (
          (crimeTypes ?? []).map((ct: any) => {
            const isSelected = selected === ct.slug;
            return (
              <TouchableOpacity
                key={ct.id}
                onPress={() => handleSelect(ct.slug)}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: isSelected ? '#eef2f7' : '#ffffff',
                  borderRadius: 12, borderWidth: 1,
                  borderColor: isSelected ? '#03224d' : '#e0e3e6',
                  padding: 16, marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 28, marginRight: 12 }}>⚠️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: '600', color: '#191c1e' }}>{ct.name}</Text>
                  <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#747780', marginTop: 2 }}>{ct.description}</Text>
                </View>
                {isSelected && (
                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#03224d', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#ffffff', fontSize: 14 }}>{'✓'}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}

        {/* Description */}
        <Text style={{ fontSize: 16, fontWeight: '600', fontFamily: 'Inter', color: '#191c1e', marginTop: 24, marginBottom: 12 }}>
          Describe brevemente lo ocurrido
        </Text>
        <TextInput
          style={{
            backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#c4c6d0',
            padding: 16, fontSize: 15, fontFamily: 'Inter', color: '#191c1e',
            minHeight: 100, textAlignVertical: 'top',
          }}
          placeholder="Describe lo sucedido..."
          placeholderTextColor="#747780"
          multiline
          value={desc}
          onChangeText={setDesc}
        />

        {/* Incident date */}
        <Text style={{ fontSize: 16, fontWeight: '600', fontFamily: 'Inter', color: '#191c1e', marginTop: 24, marginBottom: 12 }}>
          Fecha del incidente
        </Text>
        <TextInput
          style={{
            backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#c4c6d0',
            padding: 16, fontSize: 15, fontFamily: 'Inter', color: '#191c1e',
          }}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#747780"
          value={date}
          onChangeText={setDate}
        />



        {/* Continue button */}
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!selected || !desc.trim()}
          style={{
            backgroundColor: selected && desc.trim() ? '#03224d' : '#c4c6d0',
            paddingVertical: 14, borderRadius: 12, alignItems: 'center',
            marginTop: 24, marginBottom: 40,
          }}
        >
          <Text style={{ color: '#ffffff', fontFamily: 'Inter', fontSize: 16, fontWeight: '600' }}>
            Continuar →
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
