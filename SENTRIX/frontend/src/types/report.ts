export interface Report {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  priority: 'baja' | 'media' | 'alta' | 'critica';
  source: 'ciudadano' | 'oficial' | 'etl';
  is_verified: boolean;
  incident_date: string;
  created_at: string;
  user?: import('./auth').User;
  crime_type?: CrimeType;
  category?: Category;
  status?: ReportStatus;
  media?: Media[];
}

export interface CrimeType {
  id: number;
  name: string;
  slug: string;
  severity_weight: number;
  icon?: string;
  color?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number;
}

export interface ReportStatus {
  id: number;
  name: string;
  slug: string;
  color: string;
}

export interface Media {
  id: number;
  type: 'image' | 'video' | 'audio' | 'document';
  filename: string;
  original_name: string;
  path: string;
  mime_type: string;
  size_bytes?: number;
  metadata?: any;
}

export interface CreateReportRequest {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  crime_type_id?: number;
  category_id?: number;
  incident_date: string;
  priority?: 'baja' | 'media' | 'alta' | 'critica';
  media?: any[];
  is_anonymous?: boolean;
}
