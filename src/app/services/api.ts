import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type Rarity = 'ZERO' | 'DOUBLE' | 'TRIPLE';

export const RARITY_LABEL: Record<Rarity, string> = {
  ZERO: '0',
  DOUBLE: '00',
  TRIPLE: '000',
};

export const RARITIES: Rarity[] = ['ZERO', 'DOUBLE', 'TRIPLE'];

export interface Sinner {
  id: number;
  name: string;
}

export interface Identity {
  id: number;
  name: string;
  rarity: Rarity;
  sinnerId: number;
  sinnerName: string;
  uptie1ArtUrl: string | null;
  uptie3ArtUrl: string | null;
  uptieCutscene: string | null;
  obtainmentVideoUrl: string | null;
  quote: string | null;
  revealAt: number | null;
}

export interface IdentityRequest {
  name: string;
  rarity: Rarity;
  sinnerId: number | null;
  uptie1ArtUrl: string | null;
  uptie3ArtUrl: string | null;
  uptieCutscene: string | null;
  obtainmentVideoUrl: string | null;
  quote: string | null;
  revealAt: number | null;
}

export interface Ego {
  id: number;
  name: string;
  sinnerId: number;
  sinnerName: string;
  artUrl: string | null;
  obtainmentVideoUrl: string | null;
}

export interface EgoRequest {
  name: string;
  sinnerId: number | null;
  artUrl: string | null;
  obtainmentVideoUrl: string | null;
}

export interface Banner {
  id: number;
  name: string;
  thumbnailUrl: string | null;
  active: boolean;
  identities: Identity[];
  egos: Ego[];
}

export interface BannerRequest {
  name: string;
  thumbnailUrl: string | null;
  active: boolean;
  identityIds: number[];
  egoIds: number[];
}

const API = location.hostname === 'localhost'
  ? 'http://localhost:8080'
  : 'https://limbus-admin-api.onrender.com';

@Injectable({ providedIn: 'root' })
export class Api {
  private http = inject(HttpClient);

  // sinners
  getSinners() {
    return this.http.get<Sinner[]>(`${API}/sinners`);
  }

  // identities
  getIdentities() {
    return this.http.get<Identity[]>(`${API}/identities`);
  }

  createIdentity(body: IdentityRequest) {
    return this.http.post<Identity>(`${API}/identities`, body);
  }

  updateIdentity(id: number, body: IdentityRequest) {
    return this.http.put<Identity>(`${API}/identities/${id}`, body);
  }

  deleteIdentity(id: number) {
    return this.http.delete<void>(`${API}/identities/${id}`);
  }

  // egos
  getEgos() {
    return this.http.get<Ego[]>(`${API}/egos`);
  }

  createEgo(body: EgoRequest) {
    return this.http.post<Ego>(`${API}/egos`, body);
  }

  updateEgo(id: number, body: EgoRequest) {
    return this.http.put<Ego>(`${API}/egos/${id}`, body);
  }

  deleteEgo(id: number) {
    return this.http.delete<void>(`${API}/egos/${id}`);
  }

  // banners
  getBanners() {
    return this.http.get<Banner[]>(`${API}/banners`);
  }

  createBanner(body: BannerRequest) {
    return this.http.post<Banner>(`${API}/banners`, body);
  }

  updateBanner(id: number, body: BannerRequest) {
    return this.http.put<Banner>(`${API}/banners/${id}`, body);
  }

  deleteBanner(id: number) {
    return this.http.delete<void>(`${API}/banners/${id}`);
  }
}

export function errorMessage(err: unknown): string {
  const e = err as { status?: number; error?: { error?: string } };
  if (e?.status === 0) {
    return 'Não foi possível falar com a API. Ela está rodando em localhost:8080?';
  }
  return e?.error?.error ?? 'Erro inesperado';
}

export function orNull(value: string): string | null {
  const v = value.trim();
  return v ? v : null;
}
