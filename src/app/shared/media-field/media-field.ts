import { Component, ElementRef, inject, input, model, output, signal, viewChild } from '@angular/core';
import { finalize } from 'rxjs';
import { Upload } from '../../services/upload';

@Component({
  selector: 'app-media-field',
  templateUrl: './media-field.html',
  styleUrl: './media-field.css',
})
export class MediaField {
  private upload = inject(Upload);

  label = input.required<string>();
  type = input<'image' | 'video'>('image');
  url = model<string>('');

  pickTime = input(false);
  timePicked = output<number>();

  private player = viewChild<ElementRef<HTMLVideoElement>>('player');

  loading = signal(false);
  error = signal('');

  onFile(event: Event) {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0];
    if (!file) return;

    this.loading.set(true);
    this.error.set('');

    this.upload.uploadFile(file)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: url => this.url.set(url),
        error: () => this.error.set('Falha no upload. Confira o preset do Cloudinary.'),
      });

    inputEl.value = '';
  }

  useCurrentTime() {
    const video = this.player()?.nativeElement;
    if (!video) return;
    this.timePicked.emit(Math.round(video.currentTime * 10) / 10);
  }

  clear() {
    this.url.set('');
  }
}
