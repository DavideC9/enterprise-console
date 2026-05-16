import {
  Component, inject, signal, computed,
  OnInit, ChangeDetectionStrategy
} from '@angular/core';
import {RouterLink} from '@angular/router';
import {SectionsService} from '../../../core/services/sections.service';
import {ToastService} from '../../../core/services/toast.service';
import {Section} from '../../../shared/models/api.models';

@Component({
  selector: 'app-sections-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="page">

      <header class="page-header">
        <div class="page-title">
          <h1>Sezioni</h1>
          <p>Gestisci i contenuti del tuo sito web</p>
        </div>
        <div class="header-actions">
          @if (orderChanged()) {
            <button class="btn-save-order" (click)="saveOrder()" [disabled]="savingOrder()">
              @if (savingOrder()) {
                <span class="spinner-sm"></span> Salvataggio...
              } @else {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Salva ordine
              }
            </button>
          }
          <a routerLink="/sections/new" class="btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuova sezione
          </a>
        </div>
      </header>

      <div class="stats">
        <div class="stat">
          <span class="stat-n">{{ sections().length }}</span>
          <span class="stat-l">Totali</span>
        </div>
        <div class="stat">
          <span class="stat-n published">{{ publishedCount() }}</span>
          <span class="stat-l">Pubblicate</span>
        </div>
        <div class="stat">
          <span class="stat-n draft">{{ draftCount() }}</span>
          <span class="stat-l">Bozze</span>
        </div>
        <div class="stat">
          <span class="stat-n image">{{ withImageCount() }}</span>
          <span class="stat-l">Con immagine</span>
        </div>
      </div>

      <div class="search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Cerca per chiave, titolo, descrizione o indirizzo..."
          [value]="searchQuery()"
          (input)="searchQuery.set($any($event.target).value)"
        />
        @if (searchQuery()) {
          <button class="clear-search" (click)="searchQuery.set('')">✕</button>
        }
      </div>

      @if (orderChanged()) {
        <div class="order-notice">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Trascina le righe per riordinare, poi clicca "Salva ordine"
        </div>
      }

      @if (loading()) {
        <div class="state-box">
          <div class="spinner-lg"></div>
          <p>Caricamento sezioni...</p>
        </div>
      } @else if (filteredSections().length === 0) {
        <div class="state-box">
          @if (searchQuery()) {
            <div class="empty-icon">🔍</div>
            <h3>Nessun risultato</h3>
            <p>Nessuna sezione trovata per "{{ searchQuery() }}"</p>
            <button class="btn-secondary" (click)="searchQuery.set('')">Rimuovi filtro</button>
          } @else {
            <div class="empty-icon">▦</div>
            <h3>Nessuna sezione ancora</h3>
            <p>Crea la tua prima sezione per iniziare</p>
            <a routerLink="/sections/new" class="btn-primary">Crea sezione</a>
          }
        </div>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th class="drag-th"></th>
                <th>Chiave</th>
                <th>Titolo / Indirizzo</th>
                <th>Immagini</th>
                <th>Stato</th>
                <th>Aggiornata</th>
                <th class="actions-th">Azioni</th>
              </tr>
            </thead>
            <tbody>
              @for (s of filteredSections(); track s.id; let i = $index) {
                <tr
                  draggable="true"
                  [class.dragging-row]="dragIndex() === i"
                  [class.drag-over-row]="dragOverIndex() === i && dragIndex() !== i"
                  (dragstart)="onDragStart(i)"
                  (dragover)="onDragOver($event, i)"
                  (dragleave)="onDragLeave()"
                  (drop)="onDrop(i)"
                  (dragend)="onDragEnd()"
                >
                  <td class="drag-handle-td">
                    <div class="drag-handle" title="Trascina per riordinare">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="8" y1="6" x2="16" y2="6"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                        <line x1="8" y1="18" x2="16" y2="18"/>
                      </svg>
                    </div>
                  </td>
                  <td>
                    <code class="key-tag">{{ s.key }}</code>
                  </td>
                  <td class="title-td">
                    <span class="td-title">{{ s.title || '—' }}</span>
                    @if (s.address) {
                      <span class="td-sub">{{ s.address }}</span>
                    }
                  </td>
                  <td>
                    @if (getMainImage(s)) {
                      <div class="thumb-wrap">
                        <img [src]="getMainImage(s)!" class="thumb"
                             [alt]="s.title || s.key" loading="lazy"/>
                        @if (getImagesCount(s) > 1) {
                          <span class="img-count">+{{ getImagesCount(s) - 1 }}</span>
                        }
                      </div>
                    } @else {
                      <span class="no-img">—</span>
                    }
                  </td>
                  <td>
                    <div class="status-stack">
                      <span [class]="s.is_published ? 'badge green' : 'badge amber'">
                        {{ s.is_published ? 'Pubblicata' : 'Bozza' }}
                      </span>
                      @if (s.status) {
                        <span class="badge-status">{{ statusLabel(s.status) }}</span>
                      }
                    </div>
                  </td>
                  <td class="date-td">{{ formatDate(s.updated_at) }}</td>
                  <td>
                    <div class="row-actions">
                      <a [routerLink]="['/sections/edit', s.key]" class="action-btn edit-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Modifica
                      </a>
                      <button class="action-btn delete-btn" (click)="confirmDelete(s)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/>
                          <path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
          <div class="table-footer">
            {{ filteredSections().length }} di {{ sections().length }} sezioni
            @if (!searchQuery()) {
              · <span class="footer-hint">Trascina le righe per riordinare</span>
            }
          </div>
        </div>
      }
    </div>

    @if (deleteTarget()) {
      <div class="modal-overlay" (click)="deleteTarget.set(null)">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
          </div>
          <h3>Elimina sezione</h3>
          <p>Stai per eliminare la sezione <strong>{{ deleteTarget()?.key }}</strong>.
             Questa operazione è irreversibile e cancellerà anche le immagini associate.</p>
          <div class="modal-btns">
            <button class="btn-secondary" (click)="deleteTarget.set(null)" [disabled]="deleting()">Annulla</button>
            <button class="btn-danger" (click)="doDelete()" [disabled]="deleting()">
              @if (deleting()) { <span class="spinner-sm"></span> }
              Elimina
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { max-width: 1100px; animation: fadeIn 0.3s ease; }

    .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 28px; }
    h1 { font-family: var(--font-serif); font-size: 30px; font-weight: 400; color: var(--text-primary); margin-bottom: 6px; }
    .page-title p { color: var(--text-secondary); font-size: 14px; }

    .header-actions { display: flex; align-items: center; gap: 10px; }

    .btn-primary {
      display: inline-flex; align-items: center; gap: 7px;
      background: var(--accent); color: #fff;
      padding: 11px 20px; border-radius: var(--radius-sm);
      font-size: 14px; font-weight: 600; border: none; cursor: pointer;
      transition: background 0.2s; white-space: nowrap; text-decoration: none;
    }
    .btn-primary svg { width: 16px; height: 16px; }
    .btn-primary:hover { background: var(--accent-hover); }

    .btn-save-order {
      display: inline-flex; align-items: center; gap: 7px;
      background: rgba(62,207,142,0.15); color: var(--accent);
      border: 1px solid var(--accent); padding: 10px 18px;
      border-radius: var(--radius-sm); font-size: 14px; font-weight: 600;
      font-family: var(--font-sans); cursor: pointer; transition: all 0.2s;
      white-space: nowrap;
    }
    .btn-save-order svg { width: 15px; height: 15px; }
    .btn-save-order:hover:not(:disabled) { background: rgba(62,207,142,0.25); }
    .btn-save-order:disabled { opacity: 0.6; cursor: not-allowed; }

    /* Order notice */
    .order-notice {
      display: flex; align-items: center; gap: 8px;
      background: rgba(62,207,142,0.08);
      border: 1px solid rgba(62,207,142,0.2);
      border-radius: var(--radius-sm);
      padding: 10px 16px;
      color: var(--accent); font-size: 13px;
      margin-bottom: 16px;
      animation: fadeIn 0.2s ease;
    }
    .order-notice svg { width: 16px; height: 16px; flex-shrink: 0; }

    /* Stats */
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .stat { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; display: flex; flex-direction: column; gap: 4px; }
    .stat-n { font-size: 30px; font-weight: 700; color: var(--text-primary); line-height: 1; }
    .stat-n.published { color: var(--green); }
    .stat-n.draft     { color: var(--amber); }
    .stat-n.image     { color: #818cf8; }
    .stat-l { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }

    /* Search */
    .search-bar { position: relative; margin-bottom: 20px; display: flex; align-items: center; }
    .search-bar svg { position: absolute; left: 14px; width: 16px; height: 16px; color: var(--text-muted); pointer-events: none; }
    .search-bar input { width: 100%; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 11px 40px 11px 42px; color: var(--text-primary); font-size: 14px; font-family: var(--font-sans); outline: none; transition: border-color 0.2s; }
    .search-bar input:focus { border-color: var(--accent); }
    .clear-search { position: absolute; right: 12px; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 13px; padding: 4px 6px; border-radius: 4px; }
    .clear-search:hover { color: var(--text-primary); }

    /* States */
    .state-box { text-align: center; padding: 80px 20px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .empty-icon { font-size: 48px; opacity: 0.3; }
    .state-box h3 { color: var(--text-primary); font-size: 18px; font-weight: 600; }
    .state-box p { color: var(--text-secondary); font-size: 14px; }
    .spinner-lg { width: 36px; height: 36px; border: 3px solid var(--accent-light); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; margin-bottom: 8px; }

    /* Table */
    .table-wrap { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    thead { background: rgba(255,255,255,0.03); }
    th { color: var(--text-muted); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; padding: 14px 20px; text-align: left; border-bottom: 1px solid var(--border); }
    .drag-th { width: 40px; padding: 14px 8px 14px 16px; }
    .actions-th { text-align: right; }
    td { padding: 15px 20px; border-top: 1px solid var(--border); color: var(--text-secondary); font-size: 14px; vertical-align: middle; }
    tr { transition: background 0.15s; }
    tr:hover td { background: var(--bg-card-hover); }

    /* Drag states */
    .dragging-row td { opacity: 0.4; background: rgba(62,207,142,0.04); }
    .drag-over-row td { background: rgba(62,207,142,0.08) !important; border-top: 2px solid var(--accent); }

    /* Drag handle */
    .drag-handle-td { padding: 15px 8px 15px 16px; width: 40px; }
    .drag-handle {
      width: 24px; height: 24px;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-muted); cursor: grab;
      border-radius: 4px; transition: all 0.15s;
    }
    .drag-handle:hover { color: var(--accent); background: var(--accent-light); }
    .drag-handle:active { cursor: grabbing; }
    .drag-handle svg { width: 14px; height: 14px; }

    /* Cells */
    .key-tag { background: var(--accent-light); color: #818cf8; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-family: 'Courier New', monospace; }
    .title-td { max-width: 220px; }
    .td-title { display: block; color: var(--text-primary); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .td-sub { display: block; color: var(--text-muted); font-size: 12px; margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .thumb-wrap { position: relative; display: inline-block; }
    .thumb { width: 44px; height: 44px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border); display: block; }
    .img-count { position: absolute; bottom: -6px; right: -8px; background: var(--accent); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 5px; border-radius: 8px; line-height: 1.2; white-space: nowrap; }
    .no-img { color: var(--text-muted); }
    .status-stack { display: flex; flex-direction: column; gap: 5px; align-items: flex-start; }
    .badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .badge.green { background: var(--green-light); color: #4ade80; }
    .badge.amber { background: var(--amber-light); color: #fbbf24; }
    .badge-status { font-size: 11px; color: var(--text-muted); background: rgba(255,255,255,0.05); border: 1px solid var(--border); padding: 2px 8px; border-radius: 10px; }
    .date-td { color: var(--text-muted); font-size: 13px; white-space: nowrap; }

    /* Row actions */
    .row-actions { display: flex; gap: 8px; justify-content: flex-end; align-items: center; }
    .action-btn { display: inline-flex; align-items: center; gap: 5px; padding: 7px 12px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid var(--border); transition: all 0.15s; text-decoration: none; font-family: var(--font-sans); }
    .action-btn svg { width: 14px; height: 14px; }
    .edit-btn { background: var(--bg-card-hover); color: var(--text-primary); }
    .edit-btn:hover { border-color: var(--accent); color: #818cf8; }
    .delete-btn { background: none; color: var(--text-muted); padding: 7px 10px; }
    .delete-btn:hover { background: var(--red-light); border-color: rgba(239,68,68,0.3); color: #fca5a5; }

    .table-footer { padding: 12px 20px; font-size: 13px; color: var(--text-muted); border-top: 1px solid var(--border); }
    .footer-hint { color: var(--text-muted); font-size: 12px; opacity: 0.7; }

    /* Buttons */
    .btn-secondary { padding: 10px 20px; background: var(--bg-card-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 14px; font-family: var(--font-sans); cursor: pointer; text-decoration: none; transition: all 0.15s; }
    .btn-secondary:hover { border-color: var(--accent); }
    .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; animation: fadeIn 0.2s ease; }
    .modal { background: #13131e; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 36px; max-width: 420px; width: 100%; text-align: center; box-shadow: var(--shadow); }
    .modal-icon { width: 52px; height: 52px; background: var(--red-light); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
    .modal-icon svg { width: 22px; height: 22px; color: var(--red); }
    .modal h3 { color: var(--text-primary); font-size: 18px; font-weight: 600; margin-bottom: 12px; }
    .modal p { color: var(--text-secondary); font-size: 14px; line-height: 1.6; margin-bottom: 28px; }
    .modal strong { color: var(--text-primary); }
    .modal-btns { display: flex; gap: 12px; justify-content: center; }
    .btn-danger { display: inline-flex; align-items: center; gap: 6px; padding: 11px 24px; background: var(--red); color: #fff; border: none; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600; font-family: var(--font-sans); cursor: pointer; transition: background 0.2s; }
    .btn-danger:hover:not(:disabled) { background: #dc2626; }
    .btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }
    .spinner-sm { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.65s linear infinite; }
  `],
})
export class SectionsListComponent implements OnInit {
  private svc   = inject(SectionsService);
  private toast = inject(ToastService);

  sections     = signal<Section[]>([]);
  loading      = signal(true);
  searchQuery  = signal('');
  deleteTarget = signal<Section | null>(null);
  deleting     = signal(false);
  savingOrder  = signal(false);

  // Indici drag & drop
  dragIndex     = signal<number>(-1);
  dragOverIndex = signal<number>(-1);

  // Ordine originale al momento del caricamento (per rilevare modifiche)
  private originalOrder: string[] = [];
  orderChanged = signal(false);

  filteredSections = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.sections();
    return this.sections().filter(s =>
      s.key.toLowerCase().includes(q) ||
      s.title?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.address?.toLowerCase().includes(q)
    );
  });

  publishedCount = computed(() => this.sections().filter(s => s.is_published).length);
  draftCount     = computed(() => this.sections().filter(s => !s.is_published).length);
  withImageCount = computed(() => this.sections().filter(s => this.getImagesCount(s) > 0).length);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: res => {
        this.sections.set(res.items);
        this.originalOrder = res.items.map(s => s.key);
        this.orderChanged.set(false);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Errore nel caricamento sezioni');
        this.loading.set(false);
      },
    });
  }

  // ── Drag & Drop ───────────────────────────────────────────────
  onDragStart(index: number) {
    this.dragIndex.set(index);
  }

  onDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    this.dragOverIndex.set(index);
  }

  onDragLeave() {
    this.dragOverIndex.set(-1);
  }

  onDrop(targetIndex: number) {
    const from = this.dragIndex();
    const to   = targetIndex;

    if (from === -1 || from === to) {
      this.dragIndex.set(-1);
      this.dragOverIndex.set(-1);
      return;
    }

    // Sposta l'elemento nella lista sections
    this.sections.update(list => {
      const copy = [...list];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });

    // Controlla se l'ordine è cambiato rispetto all'originale
    const currentOrder = this.sections().map(s => s.key);
    const changed = currentOrder.some((key, i) => key !== this.originalOrder[i]);
    this.orderChanged.set(changed);

    this.dragIndex.set(-1);
    this.dragOverIndex.set(-1);
  }

  onDragEnd() {
    this.dragIndex.set(-1);
    this.dragOverIndex.set(-1);
  }

  saveOrder() {
    this.savingOrder.set(true);

    const items = this.sections().map((s, i) => ({
      key: s.key,
      sort_order: i + 1,
    }));

    this.svc.reorder(items).subscribe({
      next: () => {
        this.originalOrder = this.sections().map(s => s.key);
        this.orderChanged.set(false);
        this.savingOrder.set(false);
        this.toast.success('Ordine salvato');
      },
      error: () => {
        this.toast.error("Errore nel salvataggio dell'ordine");
        this.savingOrder.set(false);
      },
    });
  }

  // ── CRUD ──────────────────────────────────────────────────────
  confirmDelete(s: Section) { this.deleteTarget.set(s); }

  doDelete() {
    const t = this.deleteTarget();
    if (!t) return;
    this.deleting.set(true);
    this.svc.delete(t.key).subscribe({
      next: () => {
        this.sections.update(list => list.filter(s => s.id !== t.id));
        this.originalOrder = this.originalOrder.filter(k => k !== t.key);
        this.deleteTarget.set(null);
        this.deleting.set(false);
        this.toast.success(`Sezione "${t.key}" eliminata`);
      },
      error: () => {
        this.toast.error("Errore durante l'eliminazione");
        this.deleting.set(false);
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  getMainImage(section: Section): string | null {
    return section.images?.[0]?.url ?? null;
  }

  getImagesCount(section: Section): number {
    return section.images?.length ?? 0;
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      available: 'Disponibile',
      sold:      'Venduto',
      reserved:  'Riservato',
      rented:    'Affittato',
    };
    return map[status] ?? status;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('it-IT', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }
}
