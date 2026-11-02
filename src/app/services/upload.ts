import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Upload {

  private http = inject(HttpClient);

  readonly pending = signal(0);

  uploadFile(file: File): Observable<string> {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'limbus');

    this.pending.update(n => n + 1);

    return this.http
      .post<{ secure_url: string }>(
        'https://api.cloudinary.com/v1_1/kaicius/auto/upload', data)
      .pipe(
        map(res => res.secure_url),
        finalize(() => this.pending.update(n => n - 1)),
      );
  }
}
