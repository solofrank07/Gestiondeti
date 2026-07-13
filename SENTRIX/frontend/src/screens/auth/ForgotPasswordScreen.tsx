import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import { router } from 'expo-router';

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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#f7f9fc', paddingHorizontal: 24 }}>
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 60, marginBottom: 24 }}>
        <Text style={{ fontSize: 24 }}>←</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 24, fontWeight: '700', fontFamily: 'Inter', color: '#03224d', marginBottom: 8 }}>
        Recuperar contraseña
      </Text>
      <Text style={{ fontSize: 15, fontFamily: 'Inter', color: '#44474f', marginBottom: 32, lineHeight: 22 }}>
        Te enviaremos un enlace para restablecer tu contraseña.
      </Text>

      {sent ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📧</Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 15, color: '#44474f', textAlign: 'center', lineHeight: 22 }}>
            Si el email existe, recibirás un enlace para restablecer tu contraseña.
          </Text>
        </View>
      ) : (
        <>
          {error && <Text style={{ color: '#ba1a1a', textAlign: 'center', marginBottom: 16 }}>{error}</Text>}
          <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#c4c6d0', paddingHorizontal: 16, marginBottom: 4 }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>✉️</Text>
              <TextInput
                style={{ flex: 1, paddingVertical: 14, fontSize: 15, fontFamily: 'Inter', color: '#191c1e' }}
                placeholder="Correo electrónico" placeholderTextColor="#747780"
                autoCapitalize="none" keyboardType="email-address"
                onChangeText={onChange} value={value}
              />
            </View>
          )} />
          {errors.email && <Text style={{ color: '#ba1a1a', fontSize: 13, marginBottom: 24 }}>{errors.email.message}</Text>}

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)} disabled={loading}
            style={{ backgroundColor: '#03224d', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 }}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: '#ffffff', fontFamily: 'Inter', fontSize: 16, fontWeight: '600' }}>Enviar enlace</Text>}
          </TouchableOpacity>
        </>
      )}
    </KeyboardAvoidingView>
  );
}
