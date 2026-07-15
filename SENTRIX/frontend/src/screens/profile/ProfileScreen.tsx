import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { BarChart2, Inbox } from '@/components/shared/Icons';

export default function ProfileScreen() {
  const { user, isLoading, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f7f9fc', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#03224d" />
        <Text style={{ fontFamily: 'Inter', fontSize: 15, color: '#747780', marginTop: 12 }}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!user) return null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f7f9fc' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', fontFamily: 'Inter', color: '#03224d' }}>Perfil</Text>
      </View>

      {/* Avatar & name */}
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <View style={{
          width: 72, height: 72, borderRadius: 36,
          backgroundColor: '#03224d', alignItems: 'center', justifyContent: 'center',
          marginBottom: 12,
        }}>
          <Text style={{ fontSize: 28, color: '#ffffff', fontWeight: '700' }}>{user.name.charAt(0)}</Text>
        </View>
        <Text style={{ fontFamily: 'Inter', fontSize: 18, fontWeight: '700', color: '#191c1e' }}>{user.name}</Text>
        <Text style={{ fontFamily: 'Inter', fontSize: 14, color: '#747780', marginTop: 2 }}>{user.email}</Text>
        <View style={{ marginTop: 8, backgroundColor: '#eef2f7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 }}>
          <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#03224d', fontWeight: '500' }}>
            {user.roles?.map((r: any) => r.name).join(', ')}
          </Text>
        </View>
      </View>

      {/* Info cards */}
      <View style={{ paddingHorizontal: 20 }}>
        <InfoRow label="Teléfono" value={user.phone || '—'} />
        <InfoRow label="Documento" value={`${user.document_type?.toUpperCase() || '—'}: ${user.document_number || '—'}`} />
        <InfoRow label="Miembro desde" value={new Date(user.created_at).toLocaleDateString('es-PE')} />

        {/* Admin links */}
        {user.roles?.some((r: any) => r.name === 'Administrador') && (
          <>
            <TouchableOpacity
              onPress={() => router.push('/(admin)/dashboard')}
              style={actionBtn}
            >
              <BarChart2 size={20} color="#03224d" /><Text style={actionText}> Panel de Autoridades</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(admin)/etl')}
              style={actionBtn}
            >
              <Inbox size={20} color="#03224d" /><Text style={actionText}> ETL — Importación</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: '#ffdad6', borderRadius: 12,
            paddingVertical: 14, alignItems: 'center', marginTop: 16, marginBottom: 40,
          }}
        >
          <Text style={{ fontFamily: 'Inter', fontSize: 15, color: '#ba1a1a', fontWeight: '600' }}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{
      backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6',
      padding: 16, marginBottom: 8,
    }}>
      <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#747780', marginBottom: 2 }}>{label}</Text>
      <Text style={{ fontFamily: 'Inter', fontSize: 15, color: '#191c1e' }}>{value}</Text>
    </View>
  );
}

const actionBtn: any = {
  backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6',
  padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8,
};
const actionText: any = { fontFamily: 'Inter', fontSize: 15, color: '#03224d', fontWeight: '500' };
