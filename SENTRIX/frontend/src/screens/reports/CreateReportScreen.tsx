import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useCreateReport } from '@/hooks/useReports';
import { useLocationContext } from '@/contexts/LocationContext';

const schema = yup.object({
  title: yup.string().required('Título requerido').max(200),
  description: yup.string().required('Descripción requerida'),
  priority: yup.string().oneOf(['baja', 'media', 'alta', 'critica']).default('media'),
});

type ReportForm = yup.InferType<typeof schema>;

export default function CreateReportScreen() {
  const { location } = useLocationContext();
  const createMutation = useCreateReport();
  const [success, setSuccess] = React.useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ReportForm>({
    resolver: yupResolver(schema),
    defaultValues: { title: '', description: '', priority: 'media' },
  });

  const onSubmit = async (data: ReportForm) => {
    if (!location) {
      Alert.alert('Error', 'No se pudo obtener tu ubicación.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        ...data,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        incident_date: new Date().toISOString(),
      });
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Error al crear reporte');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-gray-950">
      <ScrollView className="flex-1 px-4 pt-12">
        <Text className="text-2xl font-bold text-green-500 mb-6">Reportar Incidente</Text>

        {success && <View className="bg-green-900/50 p-3 rounded-lg mb-4"><Text className="text-green-400">Reporte creado exitosamente.</Text></View>}

        <Controller control={control} name="title" render={({ field: { onChange, value } }) => (
          <TextInput className="bg-gray-900 text-white px-4 py-3 rounded-lg mb-1 border border-gray-800" placeholder="Título del reporte" placeholderTextColor="#6b7280" onChangeText={onChange} value={value} />
        )} />
        {errors.title && <Text className="text-red-400 text-sm mb-2">{errors.title.message}</Text>}

        <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
          <TextInput className="bg-gray-900 text-white px-4 py-3 rounded-lg mb-1 border border-gray-800" placeholder="Describe lo sucedido..." placeholderTextColor="#6b7280" multiline numberOfLines={4} onChangeText={onChange} value={value} textAlignVertical="top" />
        )} />
        {errors.description && <Text className="text-red-400 text-sm mb-2">{errors.description.message}</Text>}

        <Controller control={control} name="priority" render={({ field: { onChange, value } }) => (
          <View className="mb-4">
            <Text className="text-gray-400 mb-2">Prioridad:</Text>
            <View className="flex-row gap-2">
              {(['baja', 'media', 'alta', 'critica'] as const).map((p) => (
                <TouchableOpacity key={p} className={`flex-1 py-2 rounded-lg ${value === p ? 'bg-green-600' : 'bg-gray-800'}`} onPress={() => onChange(p)}>
                  <Text className="text-white text-center text-xs capitalize">{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )} />

        <TouchableOpacity className="bg-green-600 py-3 rounded-lg items-center mt-2" onPress={handleSubmit(onSubmit)} disabled={createMutation.isPending}>
          {createMutation.isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold">Enviar Reporte</Text>}
        </TouchableOpacity>

        {location && (
          <Text className="text-gray-500 text-xs text-center mt-4">
            Ubicación: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
