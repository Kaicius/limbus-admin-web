import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Api, Ego, EgoRequest, Sinner, errorMessage, orNull } from '../services/api';
import { Upload } from '../services/upload';
import { MediaField } from '../shared/media-field/media-field';

@Component({
  selector: 'app-ego-form',
  imports: [FormsModule, MediaField],
  templateUrl: './ego-form.html',
  styleUrl: './ego-form.css',
})
export class EgoForm implements OnInit {
  private api = inject(Api);
  protected upload = inject(Upload);

  sinners = signal<Sinner[]>([]);
  items = signal<Ego[]>([]);

  editingId = signal<number | null>(null);
  name = signal('');
  sinnerId = signal<number | null>(null);
  art = signal('');
  video = signal('');

  saving = signal(false);
  message = signal('');
  isError = signal(false);

  canSave = computed(() =>
    !this.saving() && this.upload.pending() === 0 &&
    this.name().trim().length > 0 && this.sinnerId() !== null,
  );

  ngOnInit() {
    this.api.getSinners().subscribe({
      next: list => this.sinners.set(list),
      error: err => this.fail(err),
    });
    this.load();
  }

  load() {
    this.api.getEgos().subscribe({
      next: list => this.items.set(list),
      error: err => this.fail(err),
    });
  }

  save() {
    if (!this.canSave()) return;

    const body: EgoRequest = {
      name: this.name().trim(),
      sinnerId: this.sinnerId(),
      artUrl: orNull(this.art()),
      obtainmentVideoUrl: orNull(this.video()),
    };

    const id = this.editingId();
    const request = id === null
      ? this.api.createEgo(body)
      : this.api.updateEgo(id, body);

    this.saving.set(true);
    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: saved => {
        this.ok(`E.G.O. "${saved.name}" ${id === null ? 'registrado' : 'atualizado'}!`);
        this.reset(false);
        this.load();
      },
      error: err => this.fail(err),
    });
  }

  edit(e: Ego) {
    this.editingId.set(e.id);
    this.name.set(e.name);
    this.sinnerId.set(e.sinnerId);
    this.art.set(e.artUrl ?? '');
    this.video.set(e.obtainmentVideoUrl ?? '');
    this.message.set('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  remove(e: Ego) {
    if (!confirm(`Apagar o E.G.O. "${e.name}"?`)) return;

    this.api.deleteEgo(e.id).subscribe({
      next: () => {
        this.ok(`E.G.O. "${e.name}" apagado.`);
        if (this.editingId() === e.id) this.reset(false);
        this.load();
      },
      error: err => this.fail(err),
    });
  }

  reset(clearMessage = true) {
    this.editingId.set(null);
    this.name.set('');
    this.sinnerId.set(null);
    this.art.set('');
    this.video.set('');
    if (clearMessage) this.message.set('');
  }

  private ok(msg: string) {
    this.isError.set(false);
    this.message.set(msg);
  }

  private fail(err: unknown) {
    this.isError.set(true);
    this.message.set(errorMessage(err));
  }
}
