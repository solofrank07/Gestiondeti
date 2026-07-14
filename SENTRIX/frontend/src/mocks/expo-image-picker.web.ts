// @ts-nocheck — web mock for expo-image-picker
export const MediaTypeOptions = {};
export const VideoExportPreset = {};

export async function requestMediaLibraryPermissionsAsync() {
  return { status: 'granted', granted: true };
}
export async function requestCameraPermissionsAsync() {
  return { status: 'granted', granted: true };
}
export async function getMediaLibraryPermissionsAsync() {
  return { status: 'granted', granted: true };
}
export async function getCameraPermissionsAsync() {
  return { status: 'granted', granted: true };
}

export async function launchImageLibraryAsync({ mediaTypes, quality }) {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = mediaTypes?.includes('videos') ? 'video/*' : 'image/*';
    input.multiple = false;
    input.onchange = () => {
      const file = input.files[0];
      if (file) {
        const uri = URL.createObjectURL(file);
        resolve({
          canceled: false,
          assets: [{ uri, width: 0, height: 0, type: file.type }],
        });
      } else {
        resolve({ canceled: true, assets: [] });
      }
    };
    input.click();
  });
}

export async function launchCameraAsync({ quality }) {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = () => {
      const file = input.files[0];
      if (file) {
        const uri = URL.createObjectURL(file);
        resolve({
          canceled: false,
          assets: [{ uri, width: 0, height: 0, type: file.type }],
        });
      } else {
        resolve({ canceled: true, assets: [] });
      }
    };
    input.click();
  });
}
