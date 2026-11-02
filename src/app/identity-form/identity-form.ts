import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Api, Sinner } from '../services/api';
import { Upload } from '../services/upload';

type UrlField = 'uptie1ArtUrl' | 'uptie3ArtUrl' | 'uptieCutsceneUrl' | 'obtainmentVideoUrl';

@Component({
  selector: 'app-identity-form',
  imports: [FormsModule],
  templateUrl: './identity-form.html',
  styleUrl: './identity-form.css',
})
export class IdentityForm implements OnInit {
  private api = inject(Api);
  private upload = inject(Upload);

  // dados que vêm da API
  sinners = signal<Sinner[]>([]);

  // campos do formulário
  name = signal('');
  rarity = signal('ZERO');
  sinnerId = signal<number | null>(null);
  urls = signal<Record<UrlField, string>>({
    uptie1ArtUrl: '', uptie3ArtUrl: '', uptieCutsceneUrl: '', obtainmentVideoUrl: '',
  });

  // estado da tela
  uploading = signal(0);   // quantos uploads estão em andamento
  message = signal('');

  // lista usada pra desenhar os 4 inputs de arquivo no HTML
  fileFields: { key: UrlField; label: string; type: 'image' | 'video' }[] = [
    { key: 'uptie1ArtUrl', label: 'Arte Uptie 1', type: 'image' },
    { key: 'uptie3ArtUrl', label: 'Arte Uptie 3', type: 'image' },
    { key: 'uptieCutsceneUrl', label: 'Cutscene Uptie', type: 'video' },
    { key: 'obtainmentVideoUrl', label: 'Vídeo de obtenção', type: 'video' },
  ];

  ngOnInit() {
    this.api.getSinners().subscribe(list => this.sinners.set(list));
  }

  onFile(event: Event, field: UrlField) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploading.update(n => n + 1);
    this.upload.uploadFile(file)
      .pipe(finalize(() => this.uploading.update(n => n - 1)))
      .subscribe({
        next: url => this.urls.update(u => ({ ...u, [field]: url })),
        error: () => this.message.set(`Falha no upload de ${field}`),
      });
  }

  save() {
    this.api.createIdentity({
      name: this.name(),
      rarity: this.rarity(),
      sinnerId: this.sinnerId(),
      ...this.urls(),
    }).subscribe({
      next: () => this.message.set('Identity salva!'),
      error: err => this.message.set(err.error?.error ?? 'Erro ao salvar'),
    });
  }
}