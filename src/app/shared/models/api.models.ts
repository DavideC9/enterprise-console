export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface AdminUser {
  id: number;
  email: string;
  is_active: boolean;
}

export interface SectionListResponse {
  total: number;
  items: Section[];
}

export interface UploadResponse {
  filename: string;
  relative_path: string;
  public_url: string;
  size_bytes: number;
  content_type: string;
}

export interface ApiError {
  detail: string | { msg: string; type: string }[];
}

export interface SectionImage {
  url: string;
  path?: string;
}

export interface Section {
  id: number;
  key: string;
  slug: string | null;
  title: string | null;
  description: string | null;
  address: string | null;
  status: string | null;
  features: Record<string, unknown> | null;
  images: SectionImage[] | null;
  meta: Record<string, unknown> | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SectionListResponse {
  total: number;
  items: Section[];
}
