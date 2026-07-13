import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';

const schema = yup.object({
  email: yup.string().email('Email inválido').required('Email requerido'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').required('Contraseña requerida'),
});

type LoginForm = yup.InferType<typeof schema>;

export default function LoginScreen() {
  const { login } = useAuth();
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

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
      style={{ flex: 1, backgroundColor: '#f7f9fc' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{
            width: 72, height: 72, borderRadius: 36,
            backgroundColor: '#eef2f7', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Text style={{ fontSize: 36 }}>🛡️</Text>
          </View>
          <Text style={{
            fontSize: 24, fontWeight: '700', fontFamily: 'Inter',
            color: '#03224d', textAlign: 'center', marginBottom: 8,
          }}>Alerta Piura</Text>
          <Text style={{
            fontSize: 15, fontFamily: 'Inter', color: '#44474f', textAlign: 'center', lineHeight: 22,
          }}>
            Inicia sesión para reportar{'\n'}
            <Text style={{ color: '#747780', fontSize: 14 }}>
              Solo necesitas una cuenta para enviar reportes de incidentes
            </Text>
          </Text>
        </View>

        {/* Error */}
        {error ? (
          <Text style={{ color: '#ba1a1a', textAlign: 'center', marginBottom: 16, fontFamily: 'Inter', fontSize: 14 }}>
            {error}
          </Text>
        ) : null}

        {/* Email */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: '#ffffff', borderRadius: 12,
          borderWidth: 1, borderColor: '#c4c6d0',
          paddingHorizontal: 16, marginBottom: 12,
        }}>
          <Text style={{ fontSize: 20, marginRight: 12 }}>✉️</Text>
          <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
            <TextInput
              style={{
                flex: 1, paddingVertical: 14, fontSize: 15,
                fontFamily: 'Inter', color: '#191c1e',
              }}
              placeholder="Correo electrónico"
              placeholderTextColor="#747780"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={onChange}
              value={value}
            />
          )} />
        </View>
        {errors.email && <Text style={{ color: '#ba1a1a', fontSize: 13, marginBottom: 8, fontFamily: 'Inter' }}>{errors.email.message}</Text>}

        {/* Password */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: '#ffffff', borderRadius: 12,
          borderWidth: 1, borderColor: '#c4c6d0',
          paddingHorizontal: 16, marginBottom: 4,
        }}>
          <Text style={{ fontSize: 20, marginRight: 12 }}>🔒</Text>
          <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
            <TextInput
              style={{
                flex: 1, paddingVertical: 14, fontSize: 15,
                fontFamily: 'Inter', color: '#191c1e',
              }}
              placeholder="Contraseña"
              placeholderTextColor="#747780"
              secureTextEntry={!showPassword}
              onChangeText={onChange}
              value={value}
            />
          )} />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={{ fontSize: 18, color: '#747780' }}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={{ color: '#ba1a1a', fontSize: 13, marginBottom: 8, fontFamily: 'Inter' }}>{errors.password.message}</Text>}

        {/* Forgot password */}
        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={{ alignSelf: 'flex-end', marginBottom: 24 }}>
          <Text style={{ fontFamily: 'Inter', fontSize: 14, color: '#3b5ca3', fontWeight: '500' }}>
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>

        {/* Login button */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          style={{
            backgroundColor: '#03224d', paddingVertical: 14, borderRadius: 12,
            alignItems: 'center', marginBottom: 16,
          }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: '#ffffff', fontFamily: 'Inter', fontSize: 16, fontWeight: '600' }}>
              Iniciar sesión
            </Text>
          )}
        </TouchableOpacity>

        {/* Register link */}
        <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ fontFamily: 'Inter', fontSize: 14, color: '#44474f' }}>
            ¿No tienes cuenta?{' '}
            <Text style={{ color: '#03224d', fontWeight: '600' }}>Crear cuenta nueva</Text>
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: '#e0e3e6' }} />
          <Text style={{ marginHorizontal: 12, fontFamily: 'Inter', fontSize: 13, color: '#747780' }}>o</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: '#e0e3e6' }} />
        </View>

        {/* Back to map */}
        <TouchableOpacity onPress={() => router.push('/(tabs)/mapa')} style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
          <Text style={{ fontFamily: 'Inter', fontSize: 14, color: '#747780' }}>
            También puedes seguir explorando el mapa sin iniciar sesión
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/mapa')} style={{ alignItems: 'center', marginTop: 8 }}>
          <Text style={{ fontFamily: 'Inter', fontSize: 14, color: '#03224d', fontWeight: '600' }}>
            Volver al mapa →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
