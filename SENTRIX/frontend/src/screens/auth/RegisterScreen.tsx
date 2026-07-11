import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';

const schema = yup.object({
  name: yup.string().required('Nombre requerido'),
  email: yup.string().email('Email inválido').required('Email requerido'),
  password: yup.string().min(8, 'Mínimo 8 caracteres').required('Contraseña requerida'),
  password_confirmation: yup.string().oneOf([yup.ref('password')], 'Las contraseñas no coinciden').required('Confirmar contraseña'),
});

type RegisterForm = yup.InferType<typeof schema>;

export default function RegisterScreen() {
  const { register } = useAuth();
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: yupResolver(schema),
    defaultValues: { name: '', email: '', password: '', password_confirmation: '' },
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError('');
    try {
      await register(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-gray-950">
      <ScrollView className="flex-1 px-6 pt-20">
        <Text className="text-3xl font-bold text-green-500 mb-8 text-center">Crear Cuenta</Text>

        {error && <Text className="text-red-500 text-center mb-4">{error}</Text>}

        <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
          <TextInput className="bg-gray-900 text-white px-4 py-3 rounded-lg mb-1 border border-gray-800" placeholder="Nombre completo" placeholderTextColor="#6b7280" onChangeText={onChange} value={value} />
        )} />
        {errors.name && <Text className="text-red-400 text-sm mb-2">{errors.name.message}</Text>}

        <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
          <TextInput className="bg-gray-900 text-white px-4 py-3 rounded-lg mb-1 border border-gray-800" placeholder="Correo electrónico" placeholderTextColor="#6b7280" autoCapitalize="none" keyboardType="email-address" onChangeText={onChange} value={value} />
        )} />
        {errors.email && <Text className="text-red-400 text-sm mb-2">{errors.email.message}</Text>}

        <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
          <TextInput className="bg-gray-900 text-white px-4 py-3 rounded-lg mb-1 border border-gray-800" placeholder="Contraseña" placeholderTextColor="#6b7280" secureTextEntry onChangeText={onChange} value={value} />
        )} />
        {errors.password && <Text className="text-red-400 text-sm mb-2">{errors.password.message}</Text>}

        <Controller control={control} name="password_confirmation" render={({ field: { onChange, value } }) => (
          <TextInput className="bg-gray-900 text-white px-4 py-3 rounded-lg mb-1 border border-gray-800" placeholder="Confirmar contraseña" placeholderTextColor="#6b7280" secureTextEntry onChangeText={onChange} value={value} />
        )} />
        {errors.password_confirmation && <Text className="text-red-400 text-sm mb-2">{errors.password_confirmation.message}</Text>}

        <TouchableOpacity className="bg-green-600 py-3 rounded-lg items-center mt-4" onPress={handleSubmit(onSubmit)} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold text-lg">Registrarse</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
