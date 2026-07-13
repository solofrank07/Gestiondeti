import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { adminService } from '@/services/adminService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const STATUS_COLORS: Record<string, string> = {
  completed: '#22c55e', processing: '#eab308', failed: '#ef4444', cancelled: '#6b7280',
};

const SOURCES = [
  { key: 'ministerio-interior', label: 'Ministerio del Interior' },
  { key: 'inei', label: 'INEI' },
];

export default function ETLScreen() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [fetchingSource, setFetchingSource] = useState<string | null>(null);

  const { data: history, isLoading } = useQuery({
    queryKey: ['etl-history'],
    queryFn: adminService.getEtlHistory,
    refetchInterval: 30000,
  });

  const handleUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'text/csv',
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: result.assets[0].uri,
        name: result.assets[0].name,
        type: 'text/csv',
      } as any);

      const response = await adminService.importCsv(formData);
      const skipped = (response as any).skipped;
      Alert.alert(
        'Importación completada',
        `Importados: ${response.imported}\nErrores: ${response.errors?.length || 0}` +
          (skipped ? `\nOmitidos: ${skipped}` : '')
      );
      queryClient.invalidateQueries({ queryKey: ['etl-history'] });
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Error al importar CSV');
    } finally {
      setUploading(false);
    }
  };

  const handleFetch = async (source: string) => {
    setFetchingSource(source);
    try {
      const result = await adminService.fetchExternalSource(source);
      Alert.alert(
        'Sincronización completada',
        `Importados: ${result.imported}\nErrores: ${result.errors?.length || 0}` +
          (result.skipped ? `\nSaltados: ${result.skipped}` : '')
      );
      queryClient.invalidateQueries({ queryKey: ['etl-history'] });
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || `Error al conectar con ${source}`);
    } finally {
      setFetchingSource(null);
    }
  };

  const importedTotal = history?.reduce((s: number, i: any) => s + (i.imported_count || 0), 0) || 0;

  return (
    <ScrollView className="flex-1 bg-surface px-4 pt-12">
      <Text className="text-2xl font-bold text-sentrix-600 mb-6">ETL — Importación</Text>

      <View className="bg-surface-card p-4 rounded-xl mb-4 shadow-sm border border-[#e0e3e6]">
        <Text className="text-sentrix-900 font-semibold mb-3">Importar CSV</Text>
        <TouchableOpacity
          onPress={handleUpload}
          disabled={uploading}
          className="bg-sentrix-600 p-3 rounded-xl items-center"
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-medium">
              {uploading ? 'Subiendo...' : 'Seleccionar archivo CSV'}
            </Text>
          )}
        </TouchableOpacity>
        <Text className="text-sentrix-400 text-xs mt-2">
          Formatos: CSV, TXT | Max: 10MB | Columnas: título, latitud, longitud, fecha
        </Text>
      </View>

      <View className="bg-surface-card p-4 rounded-xl mb-4 shadow-sm border border-[#e0e3e6]">
        <Text className="text-sentrix-900 font-semibold mb-3">Sincronizar fuentes externas</Text>
        {SOURCES.map((source) => (
          <View key={source.key} className="flex-row items-center justify-between mb-2">
            <Text className="text-sentrix-900">{source.label}</Text>
            <TouchableOpacity
              onPress={() => handleFetch(source.key)}
              disabled={fetchingSource === source.key}
              className="bg-sentrix-600 px-4 py-2 rounded-xl"
            >
              {fetchingSource === source.key ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white text-sm font-medium">Sincronizar</Text>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View className="bg-surface-card p-4 rounded-xl mb-4 shadow-sm border border-[#e0e3e6]">
        <Text className="text-sentrix-400 text-sm font-medium mb-1">Total importado</Text>
        <Text className="text-3xl font-bold text-sentrix-600 mb-3">{importedTotal}</Text>
      </View>

      <Text className="text-sentrix-900 font-semibold text-lg mb-3">Historial</Text>
      {isLoading ? (
        <ActivityIndicator color="#03224d" className="my-10" />
      ) : history?.length === 0 ? (
        <Text className="text-sentrix-400 text-center my-10">Sin importaciones aún</Text>
      ) : (
        history?.map((imp: any) => (
          <View key={imp.id} className="bg-surface-card p-4 rounded-xl mb-3 border border-[#e0e3e6] shadow-sm">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-sentrix-900 font-medium">{imp.source}</Text>
              <View
                className="px-2 py-1 rounded-lg"
                style={{ backgroundColor: (STATUS_COLORS[imp.status] || '#747780') + '30' }}
              >
                <Text style={{ color: STATUS_COLORS[imp.status] || '#747780' }} className="text-xs font-medium">
                  {imp.status}
                </Text>
              </View>
            </View>
            <View className="flex-row gap-3 mt-1">
              <Text className="text-sentrix-400 text-xs">Filas: {imp.total_rows || 0}</Text>
              <Text className="text-safe text-xs font-medium">OK: {imp.imported_count || 0}</Text>
              {(imp.error_count || 0) > 0 && (
                <Text className="text-risk-critical text-xs font-medium">Err: {imp.error_count}</Text>
              )}
              {(imp.skipped_count || 0) > 0 && (
                <Text className="text-warning text-xs font-medium">Skip: {imp.skipped_count}</Text>
              )}
            </View>
            <Text className="text-sentrix-400 text-xs mt-1">
              {imp.created_at ? new Date(imp.created_at).toLocaleString('es-PE') : ''}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
