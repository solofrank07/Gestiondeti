export interface RiskLevel {
  id: number;
  name: string;
  slug: string;
  min_score: number;
  max_score: number;
  color: string;
}

export interface RiskHistory {
  id: number;
  risk_zone_id: number;
  risk_score: number;
  crime_count: number;
  reports_count: number;
  calculated_at: string;
}

export interface GeofenceAlert {
  zone_id: number;
  zone_name: string;
  risk_level: string;
  risk_score: number;
  event: string;
  distance: number;
  effective_radius: number;
  alternative_route?: AlternativeRoute;
}

export interface AlternativeRoute {
  suggested_lat: number;
  suggested_lng: number;
  message: string;
  escape_heading: string;
  escape_meters: number;
}

export interface GeofenceHistoryEvent {
  id: number;
  zone_name: string;
  event: string;
  latitude: number;
  longitude: number;
  distance: number;
  duration_seconds: number | null;
  heading: string | null;
  event_at: string;
}

export interface GeofenceCheckResponse {
  alerts: GeofenceAlert[];
  total_alerts: number;
}

export interface DashboardSummary {
  total_reports: number;
  verified_reports: number;
  pending_reports: number;
  verification_rate: number;
  critical_zones_count: number;
  active_zones_count: number;
  critical_zones: CriticalZone[];
}

export interface CriticalZone {
  id: number;
  name: string;
  risk_score: number;
  level: string;
  latitude?: number;
  longitude?: number;
}

export interface ReportStatistics {
  total: number;
  by_priority: Record<string, number>;
  by_status: Record<string, number>;
  by_crime_type: Record<string, number>;
  verified: number;
  pending: number;
}

export interface CrimeTypeDistribution {
  name: string;
  slug: string;
  total: number;
}

export interface ZoneStats {
  total_zones: number;
  avg_risk_score: number;
  max_risk_score: number;
  by_level: { level: string; count: number; avg_score: number }[];
}

export interface EvolutionPoint {
  date?: string;
  period?: string;
  count: number;
}

export interface ProvinceReport {
  name: string;
  total: number;
}

export interface FullDashboard {
  summary: DashboardSummary;
  statistics: ReportStatistics;
  evolution: EvolutionPoint[];
  crime_types: CrimeTypeDistribution[];
  zone_stats: ZoneStats;
  provinces: ProvinceReport[];
}

export interface PanicAlert {
  id: number;
  user_id: number;
  user_name?: string;
  latitude: number;
  longitude: number;
  address?: string;
  message?: string;
  status: 'activo' | 'atendido' | 'falso_alarma';
  attended_at?: string;
  created_at: string;
}
