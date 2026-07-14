import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, Switch } from 'react-native';
import { router } from 'expo-router';
import { riskZoneService } from '@/services/riskZoneService';
import { MapPin } from '@/components/shared/Icons';

interface RiskZone {
  id: number;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  risk_score: number;
  risk_level_id?: number;
  risk_level?: { id: number; name: string; slug: string; color: string };
  is_active: boolean;
}

interface RiskLevel {
  id: number;
  name: string;
  slug: string;
  color: string;
}

const defaultForm = {
  name: '',
  description: '',
  latitude: -5.194,
  longitude: -80.632,
  radius_meters: 500,
  risk_score: 50,
};

export default function ZonasRiesgoScreen() {
  const [zones, setZones] = useState<RiskZone[]>([]);
  const [levels, setLevels] = useState<RiskLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [z, l] = await Promise.all([
        riskZoneService.getAll(),
        riskZoneService.getRiskLevels(),
      ]);
      setZones(Array.isArray(z) ? z : []);
      setLevels(Array.isArray(l) ? l : []);
    } catch (e: any) {
      Alert.alert('Error', 'No se pudieron cargar las zonas de riesgo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setSelectedLevel(null);
    setModalOpen(true);
  };

  const openEdit = (zone: RiskZone) => {
    setEditingId(zone.id);
    setForm({
      name: zone.name,
      description: zone.description || '',
      latitude: zone.latitude,
      longitude: zone.longitude,
      radius_meters: zone.radius_meters,
      risk_score: zone.risk_score,
    });
    setSelectedLevel(zone.risk_level_id || null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio.');
      return;
    }
    const payload: any = { ...form };
    if (selectedLevel) payload.risk_level_id = selectedLevel;

    try {
      if (editingId) {
        await riskZoneService.update(editingId, payload);
      } else {
        await riskZoneService.create(payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Error al guardar.');
    }
  };

  const handleDeactivate = (id: number, name: string) => {
    Alert.alert('Desactivar zona', `Desactivar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Desactivar', style: 'destructive', onPress: async () => {
        try {
          await riskZoneService.deactivate(id);
          fetchData();
        } catch { Alert.alert('Error', 'No se pudo desactivar.'); }
      }},
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f7f9fc', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#03224d" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f9fc' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 24, color: '#191c1e' }}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 18, fontWeight: '700', fontFamily: 'Inter', color: '#03224d', textAlign: 'center', marginRight: 24 }}>
          Zonas de Riesgo
        </Text>
        <TouchableOpacity onPress={openCreate} style={{ backgroundColor: '#03224d', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 }}>
          <Text style={{ color: '#ffffff', fontFamily: 'Inter', fontSize: 14, fontWeight: '600' }}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {zones.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <MapPin size={48} color="#c4c6d0" style={{ marginBottom: 16 }} />
            <Text style={{ fontFamily: 'Inter', fontSize: 15, color: '#747780', textAlign: 'center' }}>
              No hay zonas de riesgo configuradas.
            </Text>
          </View>
        ) : zones.map((z) => {
          const levelColor = z.risk_level?.color || '#747780';
          return (
            <TouchableOpacity
              key={z.id}
              onPress={() => openEdit(z)}
              onLongPress={() => handleDeactivate(z.id, z.name)}
              style={{ backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6', padding: 16, marginBottom: 12 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: levelColor }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: '600', color: '#191c1e' }}>{z.name}</Text>
                  <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#747780', marginTop: 2 }}>
                    {z.latitude?.toFixed(4)}, {z.longitude?.toFixed(4)} · Radio: {z.radius_meters}m
                  </Text>
                  {z.risk_level && (
                    <Text style={{ fontFamily: 'Inter', fontSize: 12, color: levelColor, marginTop: 2 }}>
                      {z.risk_level.name} · Score: {z.risk_score}
                    </Text>
                  )}
                </View>
                <View style={{ backgroundColor: z.is_active ? '#22c55e20' : '#ef444420', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ fontFamily: 'Inter', fontSize: 11, color: z.is_active ? '#22c55e' : '#ef4444', fontWeight: '500' }}>
                    {z.is_active ? 'Activo' : 'Inactivo'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Create/Edit modal */}
      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '85%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', fontFamily: 'Inter', color: '#191c1e' }}>
                {editingId ? 'Editar zona' : 'Nueva zona'}
              </Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <Text style={{ fontSize: 20, color: '#747780' }}>X</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#747780', fontWeight: '500', marginBottom: 4 }}>Nombre</Text>
              <TextInput
                style={{ backgroundColor: '#f7f9fc', borderRadius: 10, padding: 14, fontSize: 15, fontFamily: 'Inter', marginBottom: 16, borderWidth: 1, borderColor: '#e0e3e6' }}
                value={form.name} onChangeText={(v) => setForm({ ...form, name: v })}
                placeholder="Nombre de la zona"
              />

              <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#747780', fontWeight: '500', marginBottom: 4 }}>Descripcion</Text>
              <TextInput
                style={{ backgroundColor: '#f7f9fc', borderRadius: 10, padding: 14, fontSize: 15, fontFamily: 'Inter', marginBottom: 16, borderWidth: 1, borderColor: '#e0e3e6', minHeight: 60, textAlignVertical: 'top' }}
                value={form.description} onChangeText={(v) => setForm({ ...form, description: v })}
                placeholder="Opcional"
                multiline
              />

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#747780', fontWeight: '500', marginBottom: 4 }}>Latitud</Text>
                  <TextInput
                    style={{ backgroundColor: '#f7f9fc', borderRadius: 10, padding: 14, fontSize: 15, fontFamily: 'Inter', borderWidth: 1, borderColor: '#e0e3e6' }}
                    value={String(form.latitude)} onChangeText={(v) => setForm({ ...form, latitude: parseFloat(v) || 0 })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#747780', fontWeight: '500', marginBottom: 4 }}>Longitud</Text>
                  <TextInput
                    style={{ backgroundColor: '#f7f9fc', borderRadius: 10, padding: 14, fontSize: 15, fontFamily: 'Inter', borderWidth: 1, borderColor: '#e0e3e6' }}
                    value={String(form.longitude)} onChangeText={(v) => setForm({ ...form, longitude: parseFloat(v) || 0 })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#747780', fontWeight: '500', marginBottom: 4 }}>Radio (metros)</Text>
              <TextInput
                style={{ backgroundColor: '#f7f9fc', borderRadius: 10, padding: 14, fontSize: 15, fontFamily: 'Inter', marginBottom: 16, borderWidth: 1, borderColor: '#e0e3e6' }}
                value={String(form.radius_meters)} onChangeText={(v) => setForm({ ...form, radius_meters: parseInt(v) || 0 })}
                keyboardType="numeric"
              />

              <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#747780', fontWeight: '500', marginBottom: 4 }}>Nivel de riesgo</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {levels.map((lv) => (
                  <TouchableOpacity
                    key={lv.id}
                    onPress={() => setSelectedLevel(lv.id)}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
                      backgroundColor: selectedLevel === lv.id ? (lv.color || '#03224d') : '#f7f9fc',
                      borderWidth: 1, borderColor: selectedLevel === lv.id ? (lv.color || '#03224d') : '#e0e3e6',
                    }}
                  >
                    <Text style={{
                      fontFamily: 'Inter', fontSize: 13, fontWeight: '500',
                      color: selectedLevel === lv.id ? '#ffffff' : '#44474f',
                    }}>{lv.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#747780', fontWeight: '500', marginBottom: 4 }}>Risk score (0-100)</Text>
              <TextInput
                style={{ backgroundColor: '#f7f9fc', borderRadius: 10, padding: 14, fontSize: 15, fontFamily: 'Inter', marginBottom: 24, borderWidth: 1, borderColor: '#e0e3e6' }}
                value={String(form.risk_score)} onChangeText={(v) => setForm({ ...form, risk_score: parseFloat(v) || 0 })}
                keyboardType="numeric"
              />

              <TouchableOpacity
                onPress={handleSave}
                style={{ backgroundColor: '#03224d', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 20 }}
              >
                <Text style={{ color: '#ffffff', fontFamily: 'Inter', fontSize: 16, fontWeight: '600' }}>
                  {editingId ? 'Actualizar' : 'Crear zona'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
