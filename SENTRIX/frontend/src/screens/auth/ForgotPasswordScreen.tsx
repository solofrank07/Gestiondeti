import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '@/services/api';
import { ENDPOINTS } from '@/constants/api';

const schema = yup.object({ email: yup.string().email('Email inválido').required('Email requerido') });
type Form = yup.InferType<typeof schema>;

export default function ForgotPasswordScreen() {
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: yupResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: Form) => {
    setLoading(true);
    setError('');
    try {
      await api.post(ENDPOINTS.FORGOT_PASSWORD, data);
      setSent(true);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-gray-950 justify-center px-6">
      <Text className="text-3xl font-bold text-green-500 mb-4 text-center">Recuperar Contraseña</Text>
      {sent ? (
        <Text className="text-gray-300 text-center">Si el email existe, recibirás un enlace para restablecer tu contraseña.</Text>
      ) : (
        <>
          {error && <Text className="text-red-500 text-center mb-4">{error}</Text>}
          <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
            <TextInput className="bg-gray-900 text-white px-4 py-3 rounded-lg mb-3 border border-gray-800" placeholder="Correo electrónico" placeholderTextColor="#6b7280" autoCapitalize="none" keyboardType="email-address" onChangeText={onChange} value={value} />
          )} />
          {errors.email && <Text className="text-red-400 text-sm mb-2">{errors.email.message}</Text>}
          <TouchableOpacity className="bg-green-600 py-3 rounded-lg items-center" onPress={handleSubmit(onSubmit)} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold">Enviar enlace</Text>}
          </TouchableOpacity>
        </>
      )}
    </KeyboardAvoidingView>
  );
}
