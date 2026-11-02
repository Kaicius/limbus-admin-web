import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Sinner {
  id: number;
  name: string;
}

export interface IdentityRequest {
  name: string;
  rarity: string;
  sinnerId: number | null;
  uptie1ArtUrl: string;
  uptie3ArtUrl: string;
  uptieCutsceneUrl: string;
  obtainmentVideoUrl: string;
}

const API = 'http://localhost:8080';

@Injectable({ providedIn: 'root' })
export class Api {
  private http = inject(HttpClient);

  getSinners() {
    return this.http.get<Sinner[]>(`${API}/sinners`);
  }

  createIdentity(body: IdentityRequest) {
    return this.http.post(`${API}/identities`, body);
  }
}