import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  Api, Banner, BannerRequest, Ego, Identity, RARITIES, RARITY_LABEL, Rarity, errorMessage, orNull,
} from '../services/api';
import { Upload } from '../services/upload';
import { MediaField } from '../shared/media-field/media-field';

@Component({
  selector: 'app-banner-form',
  imports: [FormsModule, MediaField],
  templateUrl: './banner-form.html',
  styleUrl: './banner-form.css',
})
export class BannerForm implements OnInit {
  private api = inject(Api);
  protected upload = inject(Upload);

  protected readonly rarityLabel = RARITY_LABEL;

  items = signal<Banner[]>([]);
  allIdentities = signal<Identity[]>([]);
  allEgos = signal<Ego[]>([]);

  editingId = signal<number | null>(null);
  name = signal('');
  thumbnail = signal('');
  active = signal(true);
  selectedIdentities = signal<Set<number>>(new Set());
  selectedEgos = signal<Set<number>>(new Set());

  saving = signal(false);
  message = signal('');
  isError = signal(false);

  groups = computed(() =>
    [...RARITIES].reverse().map(rarity => ({
      rarity,
      items: this.allIdentities().filter(i => i.rarity === rarity),
    })),
  );

  selectedCount = computed(() => {
    const sel = this.selectedIdentities();
    const count: Record<Rarity, number> = { ZERO: 0, DOUBLE: 0, TRIPLE: 0 };
    for (const i of this.allIdentities()) {
      if (sel.has(i.id)) count[i.rarity]++;
    }
    return count;
  });

  missingRarities = computed(() =>
    RARITIES.filter(r => this.selectedCount()[r] === 0).map(r => RARITY_LABEL[r]),
  );

  canSave = computed(() =>
    !this.saving() && this.upload.pending() === 0 &&
    this.name().trim().length > 0 && this.missingRarities().length === 0,
  );

  ngOnInit() {
    this.api.getIdentities().subscribe({
      next: list => this.allIdentities.set(list),
      error: err => this.fail(err),
    });
    this.api.getEgos().subscribe({
      next: list => this.allEgos.set(list),
      error: err => this.fail(err),
    });
    this.load();
  }

  load() {
    this.api.getBanners().subscribe({
      next: list => this.items.set(list),
      error: err => this.fail(err),
    });
  }

  toggleIdentity(id: number) {
    this.selectedIdentities.update(set => toggled(set, id));
  }

  toggleEgo(id: number) {
    this.selectedEgos.update(set => toggled(set, id));
  }

  toggleGroup(items: Identity[]) {
    const sel = this.selectedIdentities();
    const allSelected = items.every(i => sel.has(i.id));
    const next = new Set(sel);
    for (const i of items) {
      if (allSelected) next.delete(i.id);
      else next.add(i.id);
    }
    this.selectedIdentities.set(next);
  }

  isGroupFull(items: Identity[]): boolean {
    const sel = this.selectedIdentities();
    return items.length > 0 && items.every(i => sel.has(i.id));
  }

  save() {
    if (!this.canSave()) return;

    const body: BannerRequest = {
      name: this.name().trim(),
      thumbnailUrl: orNull(this.thumbnail()),
      active: this.active(),
      identityIds: [...this.selectedIdentities()],
      egoIds: [...this.selectedEgos()],
    };

    const id = this.editingId();
    const request = id === null
      ? this.api.createBanner(body)
      : this.api.updateBanner(id, body);

    this.saving.set(true);
    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: saved => {
        this.ok(`Banner "${saved.name}" ${id === null ? 'criado' : 'atualizado'}!`);
        this.reset(false);
        this.load();
      },
      error: err => this.fail(err),
    });
  }

  edit(b: Banner) {
    this.editingId.set(b.id);
    this.name.set(b.name);
    this.thumbnail.set(b.thumbnailUrl ?? '');
    this.active.set(b.active);
    this.selectedIdentities.set(new Set(b.identities.map(i => i.id)));
    this.selectedEgos.set(new Set(b.egos.map(e => e.id)));
    this.message.set('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  remove(b: Banner) {
    if (!confirm(`Apagar o banner "${b.name}"?`)) return;

    this.api.deleteBanner(b.id).subscribe({
      next: () => {
        this.ok(`Banner "${b.name}" apagado.`);
        if (this.editingId() === b.id) this.reset(false);
        this.load();
      },
      error: err => this.fail(err),
    });
  }

  reset(clearMessage = true) {
    this.editingId.set(null);
    this.name.set('');
    this.thumbnail.set('');
    this.active.set(true);
    this.selectedIdentities.set(new Set());
    this.selectedEgos.set(new Set());
    if (clearMessage) this.message.set('');
  }

  countByRarity(b: Banner, rarity: Rarity): number {
    return b.identities.filter(i => i.rarity === rarity).length;
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

function toggled(set: Set<number>, id: number): Set<number> {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}
