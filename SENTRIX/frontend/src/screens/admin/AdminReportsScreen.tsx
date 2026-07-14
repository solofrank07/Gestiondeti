import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import { useVerifyReport } from '@/hooks/useReports';
import { router } from 'expo-router';
import { Search, MapPin, AlertTriangle } from '@/components/shared/Icons';

export default function AdminReportsScreen() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('pending');
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'reports', filter],
    queryFn: () => api.get('/admin/reports', { params: { status: filter, per_page: 50 } }).then(r => r.data),
  });

  const verifyMutation = useVerifyReport();

  const reports = Array.isArray(data) ? data : data?.data ?? [];

  const filtered = search
    ? reports.filter((r: any) =>
        (r.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.user?.name || '').toLowerCase().includes(search.toLowerCase())
      )
    : reports;

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f6f7' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#ffffff' }}>
        <TouchableOpacity onPress={() => { try { router.back(); } catch { router.replace('/(admin)/dashboard'); } }}>
          <Text style={{ fontSize: 24, color: '#191c1e' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 20, fontWeight: '700', fontFamily: 'Inter', color: '#03224d', textAlign: 'center', marginRight: 24 }}>
          Reportes
        </Text>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e0e3e6' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f6f7', borderRadius: 10, paddingHorizontal: 12, height: 40 }}>
          <Search size={18} color="#747780" />
          <TextInput
            placeholder="Buscar..."
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, marginLeft: 8, fontFamily: 'Inter', fontSize: 14, color: '#191c1e' }}
            placeholderTextColor="#c4c6d0"
          />
        </View>
        {/* Filter tabs */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          {(['all', 'pending', 'verified'] as const).map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={{
                paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
                backgroundColor: filter === f ? '#03224d' : '#f0f1f3',
              }}
            >
              <Text style={{
                fontFamily: 'Inter', fontSize: 13, fontWeight: '600',
                color: filter === f ? '#ffffff' : '#747780',
              }}>
                {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendientes' : 'Verificados'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#03224d" />
        </View>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          <Text style={{ fontSize: 14, fontFamily: 'Inter', color: '#747780', marginBottom: 12 }}>
            {filtered.length} reporte{filtered.length !== 1 ? 's' : ''}
          </Text>

          {filtered.length === 0 && (
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <AlertTriangle size={48} color="#c4c6d0" />
              <Text style={{ fontFamily: 'Inter', fontSize: 15, color: '#747780', marginTop: 12 }}>No hay reportes</Text>
            </View>
          )}

          {filtered.map((r: any) => (
            <View key={r.id} style={{
              backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e3e6',
              padding: 16, marginBottom: 10,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: r.is_verified ? '#22c55e' : '#eab308' }} />
                <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#747780', fontWeight: '500' }}>
                  {r.is_verified ? 'Verificado' : 'Pendiente'}
                </Text>
                <Text style={{ fontFamily: 'Inter', fontSize: 12, color: '#03224d', fontWeight: '600' }}>
                  #{r.id}
                </Text>
              </View>

              <Text style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: '600', color: '#191c1e', marginBottom: 4 }}>
                {r.title || 'Reporte'}
              </Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 13, color: '#747780', marginBottom: 8 }} numberOfLines={2}>
                {r.description}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <MapPin size={13} color="#747780" />
                <Text style={{ fontFamily: 'Inter', fontSize: 12, color: '#747780' }}>
                  {r.address || `${r.latitude?.toFixed(4)}, ${r.longitude?.toFixed(4)}`}
                </Text>
              </View>

              {r.user && (
                <Text style={{ fontFamily: 'Inter', fontSize: 12, color: '#747780', marginBottom: 8 }}>
                  Reportado por: {r.user.name || r.user.email}
                </Text>
              )}

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <TouchableOpacity
                  onPress={() => router.push({ pathname: '/(report)/detalle', params: { id: String(r.id) } })}
                  style={{ flex: 1, backgroundColor: '#f0f1f3', borderRadius: 8, paddingVertical: 8, alignItems: 'center' }}
                >
                  <Text style={{ color: '#191c1e', fontFamily: 'Inter', fontSize: 13, fontWeight: '600' }}>Ver detalle</Text>
                </TouchableOpacity>

                {!r.is_verified && (
                  <TouchableOpacity
                    onPress={() => verifyMutation.mutate(r.id, { onSuccess: () => refetch() })}
                    disabled={verifyMutation.isPending}
                    style={{ flex: 1, backgroundColor: '#22c55e', borderRadius: 8, paddingVertical: 8, alignItems: 'center' }}
                  >
                    <Text style={{ color: '#ffffff', fontFamily: 'Inter', fontSize: 13, fontWeight: '600' }}>
                      {verifyMutation.isPending ? '...' : 'Verificar'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
