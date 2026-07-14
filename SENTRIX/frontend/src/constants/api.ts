export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
export const API_PREFIX = '/api/v1';

export const ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  LOGOUT_ALL: '/auth/logout-all',
  PROFILE: '/auth/profile',
  REFRESH: '/auth/refresh',
  CHANGE_PASSWORD: '/auth/change-password',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',

  // Map
  RISK_ZONES: '/map/risk-zones',
  HEATMAP: '/map/heatmap',
  HEATMAP_TILE: '/map/heatmap/tile/{z}/{x}/{y}',
  CLUSTERS: '/map/clusters',
  REGIONS: '/map/regions',
  PROVINCES: '/map/provinces',
  DISTRICTS: '/map/districts',

  // Reports
  REPORTS: '/reports',
  REPORTS_NEARBY: '/reports/nearby',
  REPORTS_VERIFY: (id: number) => `/reports/${id}/verify`,

  // Geofence
  GEOFENCE_CHECK: '/geofence/check',
  GEOFENCE_ZONES: (lat: number, lng: number) => `/geofence/zones/${lat}/${lng}`,

  // Panic
  PANIC: '/panic',
  PANIC_HISTORY: '/panic/history',
  PANIC_ACTIVE: '/panic/active',
  PANIC_ATTEND: (id: number) => `/panic/${id}/attend`,

  // Dashboard
  DASHBOARD_SUMMARY: '/dashboard/summary',
  DASHBOARD_STATISTICS: '/dashboard/statistics',
  REPORTS_BY_PROVINCE: (id: number) => `/dashboard/reports-by-province/${id}`,
  REPORTS_BY_DISTRICT: (id: number) => `/dashboard/reports-by-district/${id}`,
  DASHBOARD_EVOLUTION: '/dashboard/evolution',
  CRITICAL_ZONES: '/dashboard/critical-zones',

  // Admin
  ADMIN_USERS: '/admin/users',
  ADMIN_USER: (id: number) => `/admin/users/${id}`,
  ADMIN_USER_ROLE: (id: number) => `/admin/users/${id}/role`,
  ADMIN_ETL_IMPORT_CSV: '/admin/etl/import-csv',
  ADMIN_ETL_IMPORT_API: '/admin/etl/import-api',
  ADMIN_ETL_FETCH: '/admin/etl/fetch',
  ADMIN_ETL_HISTORY: '/admin/etl/history',
  ADMIN_ETL_IMPORT: (id: number) => `/admin/etl/imports/${id}`,
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_RISK_ZONES: '/admin/risk-zones',
  ADMIN_RISK_ZONE: (id: number) => `/admin/risk-zones/${id}`,
  RISK_LEVELS: '/risk-levels',
};
