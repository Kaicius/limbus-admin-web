import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  Api, Identity, IdentityRequest, RARITIES, RARITY_LABEL, Rarity, Sinner, errorMessage, orNull,
} from '../services/api';
import { Upload } from '../services/upload';
import { MediaField } from '../shared/media-field/media-field';

@Component({
  selector: 'app-identity-form',
  imports: [FormsModule, MediaField],
  templateUrl: './identity-form.html',
  styleUrl: './identity-form.css',
})
export class IdentityForm implements OnInit {
  private api = inject(Api);
  protected upload = inject(Upload);

  protected readonly rarityLabel = RARITY_LABEL;
  protected readonly rarities = RARITIES;

  sinners = signal<Sinner[]>([]);
  items = signal<Identity[]>([]);

  editingId = signal<number | null>(null);
  name = signal('');
  rarity = signal<Rarity>('ZERO');
  sinnerId = signal<number | null>(null);
  uptie1 = signal('');
  uptie3 = signal('');
  cutscene = signal('');
  video = signal('');
  quote = signal('');
  revealAt = signal<number | null>(null);

  saving = signal(false);
  message = signal('');
  isError = signal(false);
  filter = signal<Rarity | 'ALL'>('ALL');

  visible = computed(() => {
    const f = this.filter();
    return f === 'ALL' ? this.items() : this.items().filter(i => i.rarity === f);
  });

  isBase = computed(() => this.rarity() === 'ZERO');

  suggestedName = computed(() => {
    if (!this.isBase()) return '';
    const sinner = this.sinners().find(s => s.id === this.sinnerId());
    return sinner ? `LCB Sinner ${sinner.name}` : '';
  });

  finalName = computed(() => this.name().trim() || this.suggestedName());

  canSave = computed(() =>
    !this.saving() && this.upload.pending() === 0 &&
    this.finalName().length > 0 && this.sinnerId() !== null,
  );

  ngOnInit() {
    this.api.getSinners().subscribe({
      next: list => this.sinners.set(list),
      error: err => this.fail(err),
    });
    this.load();
  }

  load() {
    this.api.getIdentities().subscribe({
      next: list => this.items.set(list),
      error: err => this.fail(err),
    });
  }

  save() {
    if (!this.canSave()) return;

    const base = this.isBase();
    const body: IdentityRequest = {
      name: this.finalName(),
      rarity: this.rarity(),
      sinnerId: this.sinnerId(),
      uptie1ArtUrl: orNull(this.uptie1()),
      uptie3ArtUrl: base ? null : orNull(this.uptie3()),
      uptieCutscene: base ? null : orNull(this.cutscene()),
      obtainmentVideoUrl: base ? null : orNull(this.video()),
      quote: orNull(this.quote()),
      revealAt: base ? null : this.revealAt(),
    };

    const id = this.editingId();
    const request = id === null
      ? this.api.createIdentity(body)
      : this.api.updateIdentity(id, body);

    this.saving.set(true);
    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: saved => {
        this.ok(`Identity "${saved.name}" ${id === null ? 'registrada' : 'atualizada'}!`);
        const keepRarity = this.rarity();
        this.reset(false);
        this.rarity.set(keepRarity);
        this.load();
      },
      error: err => this.fail(err),
    });
  }

  edit(i: Identity) {
    this.editingId.set(i.id);
    this.name.set(i.name);
    this.rarity.set(i.rarity);
    this.sinnerId.set(i.sinnerId);
    this.uptie1.set(i.uptie1ArtUrl ?? '');
    this.uptie3.set(i.uptie3ArtUrl ?? '');
    this.cutscene.set(i.uptieCutscene ?? '');
    this.video.set(i.obtainmentVideoUrl ?? '');
    this.quote.set(i.quote ?? '');
    this.revealAt.set(i.revealAt);
    this.message.set('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  remove(i: Identity) {
    if (!confirm(`Apagar a identity "${i.name}"?`)) return;

    this.api.deleteIdentity(i.id).subscribe({
      next: () => {
        this.ok(`Identity "${i.name}" apagada.`);
        if (this.editingId() === i.id) this.reset(false);
        this.load();
      },
      error: err => this.fail(err),
    });
  }

  reset(clearMessage = true) {
    this.editingId.set(null);
    this.name.set('');
    this.rarity.set('ZERO');
    this.sinnerId.set(null);
    this.uptie1.set('');
    this.uptie3.set('');
    this.cutscene.set('');
    this.video.set('');
    this.quote.set('');
    this.revealAt.set(null);
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
