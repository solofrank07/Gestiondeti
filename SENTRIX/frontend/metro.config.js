const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      filePath: path.resolve(__dirname, 'src/mocks/react-native-maps.web.tsx'),
      type: 'sourceFile',
    };
  }
  if (platform === 'web' && moduleName.startsWith('react-native-svg')) {
    return {
      filePath: path.resolve(__dirname, 'src/mocks/react-native-svg.web.tsx'),
      type: 'sourceFile',
    };
  }
  if (platform === 'web' && moduleName === 'expo-image-picker') {
    return {
      filePath: path.resolve(__dirname, 'src/mocks/expo-image-picker.web.ts'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './src/global.css' });
