export const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[9][0-9]{8}$/,
  dni: /^[0-9]{8}$/,
  lat: /^-?([0-8]?[0-9]|90)(\.[0-9]{1,7})?$/,
  lng: /^-?((1[0-7][0-9])|([0-9]?[0-9]))(\.[0-9]{1,7})?$/,
};

export function isValidEmail(email: string): boolean {
  return REGEX.email.test(email);
}

export function isValidPhone(phone: string): boolean {
  return REGEX.phone.test(phone);
}

export function isInPiura(lat: number, lng: number): boolean {
  return lat >= -5.7 && lat <= -4.0 && lng >= -81.5 && lng <= -79.3;
}
