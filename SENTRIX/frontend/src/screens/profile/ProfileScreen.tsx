import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ]);
  };

  if (!user) return null;

  return (
    <ScrollView className="flex-1 bg-gray-950 px-4 pt-12">
      <View className="items-center mb-8">
        <View className="w-20 h-20 bg-green-600 rounded-full items-center justify-center mb-4">
          <Text className="text-3xl text-white font-bold">{user.name.charAt(0)}</Text>
        </View>
        <Text className="text-white text-xl font-bold">{user.name}</Text>
        <Text className="text-gray-400">{user.email}</Text>
        <View className="mt-2 px-3 py-1 bg-gray-800 rounded-full">
          <Text className="text-green-400 text-sm">{user.roles?.map((r) => r.name).join(', ')}</Text>
        </View>
      </View>

      <View className="bg-gray-900 rounded-xl p-4 mb-4">
        <Text className="text-gray-400 text-sm">Teléfono</Text>
        <Text className="text-white">{user.phone || '—'}</Text>
      </View>

      <View className="bg-gray-900 rounded-xl p-4 mb-4">
        <Text className="text-gray-400 text-sm">Documento</Text>
        <Text className="text-white">{user.document_type?.toUpperCase() || '—'}: {user.document_number || '—'}</Text>
      </View>

      <View className="bg-gray-900 rounded-xl p-4 mb-8">
        <Text className="text-gray-400 text-sm">Miembro desde</Text>
        <Text className="text-white">{new Date(user.created_at).toLocaleDateString('es-PE')}</Text>
      </View>

      <TouchableOpacity className="bg-red-600/20 border border-red-800 py-3 rounded-lg items-center" onPress={handleLogout}>
        <Text className="text-red-500 font-semibold">Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
