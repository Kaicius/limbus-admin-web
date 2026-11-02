import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Upload {

  private http = inject(HttpClient);

  uploadFile(file: File): Observable<string> {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'limbus');

    return this.http
      .post<{ secure_url: string }>(
        'https://api.cloudinary.com/v1_1/kaicius/auto/upload', data)
      .pipe(map(res => res.secure_url));
  }
}