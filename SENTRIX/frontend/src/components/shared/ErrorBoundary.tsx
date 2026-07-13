import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View className="flex-1 bg-surface justify-center items-center px-6">
          <Text className="text-4xl mb-4">⚠️</Text>
          <Text className="text-sentrix-900 text-xl font-bold mb-2">Algo salió mal</Text>
          <Text className="text-sentrix-400 text-center mb-6">
            {this.state.error?.message || 'Error inesperado en la aplicación.'}
          </Text>
          <TouchableOpacity
            className="bg-sentrix-600 px-6 py-3 rounded-xl"
            onPress={this.handleReset}
          >
            <Text className="text-white font-semibold">Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
