export interface RiskZone {
  id: number;
  name: string;
  risk_score: number;
  risk_level: string;
  color: string;
  latitude: number;
  longitude: number;
  radius: number;
  crime_count: number;
  citizen_reports_count: number;
  official_reports_count: number;
  calculated_at?: string;
  polygons?: RiskZonePolygon[];
}

export interface RiskZonePolygon {
  points: { lat: number; lng: number }[];
  fill_color: string;
  fill_opacity: number;
  stroke_width: number;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  score: number;
  level: string;
  weight: number;
}

export interface MapCluster {
  latitude: number;
  longitude: number;
  count: number;
  avg_risk_score: number;
}

export interface Region {
  id: number;
  code: string;
  name: string;
  capital?: string;
  latitude?: number;
  longitude?: number;
}

export interface Province {
  id: number;
  region_id: number;
  code: string;
  name: string;
  capital?: string;
}

export interface District {
  id: number;
  province_id: number;
  code: string;
  name: string;
}

export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
