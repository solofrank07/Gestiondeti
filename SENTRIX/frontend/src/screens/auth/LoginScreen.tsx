import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';

const schema = yup.object({
  email: yup.string().email('Email inválido').required('Email requerido'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').required('Contraseña requerida'),
});

type LoginForm = yup.InferType<typeof schema>;

export default function LoginScreen() {
  const { login } = useAuth();
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    try {
      await login(data.email, data.password);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-950 justify-center px-6">
      <View className="mb-10 items-center">
        <Text className="text-4xl font-bold text-green-500">SENTRIX</Text>
        <Text className="text-gray-400 mt-2 text-center">Sistema Inteligente de Vigilancia Territorial</Text>
      </View>

      {error && <Text className="text-red-500 text-center mb-4">{error}</Text>}

      <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
        <TextInput
          className="bg-gray-900 text-white px-4 py-3 rounded-lg mb-3 border border-gray-800"
          placeholder="Correo electrónico"
          placeholderTextColor="#6b7280"
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={onChange} value={value}
        />
      )} />
      {errors.email && <Text className="text-red-400 text-sm mb-2">{errors.email.message}</Text>}

      <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
        <TextInput
          className="bg-gray-900 text-white px-4 py-3 rounded-lg mb-3 border border-gray-800"
          placeholder="Contraseña"
          placeholderTextColor="#6b7280"
          secureTextEntry
          onChangeText={onChange} value={value}
        />
      )} />
      {errors.password && <Text className="text-red-400 text-sm mb-2">{errors.password.message}</Text>}

      <TouchableOpacity
        className="bg-green-600 py-3 rounded-lg items-center mt-2"
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold text-lg">Ingresar</Text>}
      </TouchableOpacity>

      <TouchableOpacity className="mt-4 items-center">
        <Text className="text-gray-400">¿No tienes cuenta? <Text className="text-green-500">Regístrate</Text></Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
