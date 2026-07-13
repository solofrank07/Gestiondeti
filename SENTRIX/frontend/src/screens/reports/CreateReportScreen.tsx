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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-surface">
      <ScrollView className="flex-1 px-4 pt-12">
        <Text className="text-2xl font-bold text-sentrix-600 mb-6">Reportar Incidente</Text>

        {success && <View className="bg-safe-subtle p-3 rounded-xl mb-4"><Text className="text-safe font-medium">Reporte creado exitosamente.</Text></View>}

        <Controller control={control} name="title" render={({ field: { onChange, value } }) => (
          <TextInput className="bg-surface-card text-sentrix-900 px-4 py-3 rounded-xl mb-1 border border-[#c4c6d0]" placeholder="Título del reporte" placeholderTextColor="#747780" onChangeText={onChange} value={value} />
        )} />
        {errors.title && <Text className="text-error text-sm mb-2">{errors.title.message}</Text>}

        <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
          <TextInput className="bg-surface-card text-sentrix-900 px-4 py-3 rounded-xl mb-1 border border-[#c4c6d0]" placeholder="Describe lo sucedido..." placeholderTextColor="#747780" multiline numberOfLines={4} onChangeText={onChange} value={value} textAlignVertical="top" />
        )} />
        {errors.description && <Text className="text-error text-sm mb-2">{errors.description.message}</Text>}

        <Controller control={control} name="priority" render={({ field: { onChange, value } }) => (
          <View className="mb-4">
            <Text className="text-sentrix-400 mb-2 font-medium">Prioridad:</Text>
            <View className="flex-row gap-2">
              {(['baja', 'media', 'alta', 'critica'] as const).map((p) => (
                <TouchableOpacity key={p} className={`flex-1 py-2 rounded-xl ${value === p ? 'bg-sentrix-600' : 'bg-surface-container'}`} onPress={() => onChange(p)}>
                  <Text className={`text-center text-xs capitalize font-medium ${value === p ? 'text-white' : 'text-sentrix-900'}`}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )} />

        <TouchableOpacity className="bg-sentrix-600 py-3 rounded-xl items-center mt-2" onPress={handleSubmit(onSubmit)} disabled={createMutation.isPending}>
          {createMutation.isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold">Enviar Reporte</Text>}
        </TouchableOpacity>

        {location && (
          <Text className="text-sentrix-400 text-xs text-center mt-4">
            Ubicación: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
