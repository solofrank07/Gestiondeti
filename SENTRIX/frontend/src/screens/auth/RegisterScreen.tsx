import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

const schema = yup.object({
  name: yup.string().required('Nombre requerido'),
  email: yup.string().email('Email inválido').required('Email requerido'),
  password: yup.string().min(8, 'Mínimo 8 caracteres').required('Contraseña requerida'),
  password_confirmation: yup.string().oneOf([yup.ref('password')], 'Las contraseñas no coinciden').required('Confirmar contraseña'),
});

type RegisterForm = yup.InferType<typeof schema>;

const inputStyle = {
  backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#c4c6d0',
  paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, fontFamily: 'Inter', color: '#191c1e', marginBottom: 4,
};

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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#f7f9fc' }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 24, fontWeight: '700', fontFamily: 'Inter', color: '#03224d', marginBottom: 8 }}>
          Crear cuenta nueva
        </Text>
        <Text style={{ fontSize: 15, fontFamily: 'Inter', color: '#44474f', marginBottom: 32, lineHeight: 22 }}>
          Únete a Alerta Piura para reportar incidentes y recibir alertas de seguridad.
        </Text>

        {error && <Text style={{ color: '#ba1a1a', textAlign: 'center', marginBottom: 16, fontFamily: 'Inter' }}>{error}</Text>}

        <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
          <TextInput style={inputStyle} placeholder="Nombre completo" placeholderTextColor="#747780" onChangeText={onChange} value={value} />
        )} />
        {errors.name && <Text style={{ color: '#ba1a1a', fontSize: 13, marginBottom: 8 }}>{errors.name.message}</Text>}

        <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
          <TextInput style={inputStyle} placeholder="Correo electrónico" placeholderTextColor="#747780" autoCapitalize="none" keyboardType="email-address" onChangeText={onChange} value={value} />
        )} />
        {errors.email && <Text style={{ color: '#ba1a1a', fontSize: 13, marginBottom: 8 }}>{errors.email.message}</Text>}

        <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
          <TextInput style={inputStyle} placeholder="Contraseña" placeholderTextColor="#747780" secureTextEntry onChangeText={onChange} value={value} />
        )} />
        {errors.password && <Text style={{ color: '#ba1a1a', fontSize: 13, marginBottom: 8 }}>{errors.password.message}</Text>}

        <Controller control={control} name="password_confirmation" render={({ field: { onChange, value } }) => (
          <TextInput style={inputStyle} placeholder="Confirmar contraseña" placeholderTextColor="#747780" secureTextEntry onChangeText={onChange} value={value} />
        )} />
        {errors.password_confirmation && <Text style={{ color: '#ba1a1a', fontSize: 13, marginBottom: 24 }}>{errors.password_confirmation.message}</Text>}

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)} disabled={loading}
          style={{ backgroundColor: '#03224d', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 16 }}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: '#ffffff', fontFamily: 'Inter', fontSize: 16, fontWeight: '600' }}>Crear cuenta</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Inter', fontSize: 14, color: '#44474f' }}>
            ¿Ya tienes cuenta? <Text style={{ color: '#03224d', fontWeight: '600' }}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
