import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SectionsService } from '../../../core/services/sections.service';
import { ToastService } from '../../../core/services/toast.service';
import { Section, SectionImage } from '../../../shared/models/api.models';

interface FeaturesForm {
  surface: number | null;
  floor: string;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking: number | null;
  balcony: number | null;
  terrace: number | null;
  cellar: number | null;
  year: number | null;
  energy_class: string;
  heating: string;
  elevator: boolean;
  air_conditioning: boolean;
}

interface ImageFormItem {
  id: string;
  type: 'existing' | 'new';
  url: string;
  file?: File;
  image?: SectionImage;
}

const EMPTY_FEATURES: FeaturesForm = {
  surface: null,
  floor: '',
  rooms: null,
  bedrooms: null,
  bathrooms: null,
  parking: null,
  balcony: null,
  terrace: null,
  cellar: null,
  year: null,
  energy_class: '',
  heating: '',
  elevator: false,
  air_conditioning: false,
};

@Component({
  selector: 'app-section-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <nav class="breadcrumb">
          <a routerLink="/sections">Sezioni</a>
          <span class="sep">›</span>
          <span>{{ isEdit() ? 'Modifica · ' + key() : 'Nuova sezione' }}</span>
        </nav>

        <h1>{{ isEdit() ? 'Modifica sezione' : 'Nuova sezione' }}</h1>
      </div>

      @if (loadingSection()) {
        <div class="state-box">
          <div class="spinner-lg"></div>
          <p>Caricamento...</p>
        </div>
      } @else {
        <form (ngSubmit)="submit()" #f="ngForm">
          <div class="form-layout">
            <div class="form-main">
              <div class="card">
                <h2>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Contenuto
                </h2>

                <div class="field-row">
                  <div class="field">
                    <label>
                      Chiave <span class="req">*</span>
                      <span class="label-hint">es. attico-roma</span>
                    </label>

                    <input
                      type="text"
                      name="key"
                      [(ngModel)]="formKey"
                      required
                      pattern="[a-z0-9_\\-]+"
                      placeholder="attico-roma"
                      [readonly]="isEdit()"
                      [class.readonly]="isEdit()"
                    />

                    <span class="field-hint">
                      {{ isEdit() ? 'La chiave non può essere modificata' : 'Solo minuscole, numeri e trattini' }}
                    </span>
                  </div>

                  <div class="field">
                    <label>Slug <span class="req">*</span></label>

                    <input
                      type="text"
                      name="slug"
                      [(ngModel)]="formSlug"
                      [required]="!isEdit()"
                      placeholder="attico-panoramico-roma"
                    />
                  </div>
                </div>

                <div class="field-row">
                  <div class="field">
                    <label>Titolo</label>
                    <input type="text" name="title" [(ngModel)]="formTitle" placeholder="Attico Panoramico Roma"/>
                  </div>

                  <div class="field">
                    <label>Stato immobile</label>

                    <select name="status" [(ngModel)]="formStatus">
                      <option value="">— nessuno —</option>
                      <option value="available">Disponibile</option>
                      <option value="sold">Venduto</option>
                      <option value="reserved">Riservato</option>
                      <option value="rented">Affittato</option>
                    </select>
                  </div>
                </div>

                <div class="field">
                  <label>Indirizzo</label>
                  <input type="text" name="address" [(ngModel)]="formAddress" placeholder="Via Del Corso 120, Roma"/>
                </div>

                <div class="field">
                  <label>
                    Descrizione
                    <span class="char-count">{{ formDescription.length }} caratteri</span>
                  </label>

                  <textarea
                    name="description"
                    [(ngModel)]="formDescription"
                    rows="5"
                    placeholder="Descrizione della sezione..."
                  ></textarea>
                </div>
              </div>

              <div class="card">
                <h2>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="16 18 22 12 16 6"/>
                    <polyline points="8 6 2 12 8 18"/>
                  </svg>
                  Caratteristiche
                </h2>

                <div class="features-grid">
                  <div class="field">
                    <label>Superficie</label>
                    <div class="input-unit">
                      <input type="number" name="ft_surface" [(ngModel)]="ft.surface" placeholder="180" min="0"/>
                      <span class="unit">m²</span>
                    </div>
                  </div>

                  <div class="field">
                    <label>Piano</label>
                    <input type="text" name="ft_floor" [(ngModel)]="ft.floor" placeholder="es. 3° piano, Attico"/>
                  </div>

                  <div class="field">
                    <label>Locali totali</label>
                    <input type="number" name="ft_rooms" [(ngModel)]="ft.rooms" placeholder="5" min="0"/>
                  </div>

                  <div class="field">
                    <label>Camere da letto</label>
                    <input type="number" name="ft_bedrooms" [(ngModel)]="ft.bedrooms" placeholder="3" min="0"/>
                  </div>

                  <div class="field">
                    <label>Bagni</label>
                    <input type="number" name="ft_bathrooms" [(ngModel)]="ft.bathrooms" placeholder="2" min="0"/>
                  </div>

                  <div class="field">
                    <label>Posti auto</label>
                    <input type="number" name="ft_parking" [(ngModel)]="ft.parking" placeholder="1" min="0"/>
                  </div>

                  <div class="field">
                    <label>Balconi</label>
                    <input type="number" name="ft_balcony" [(ngModel)]="ft.balcony" placeholder="0" min="0"/>
                  </div>

                  <div class="field">
                    <label>Terrazze</label>
                    <input type="number" name="ft_terrace" [(ngModel)]="ft.terrace" placeholder="0" min="0"/>
                  </div>

                  <div class="field">
                    <label>Cantine</label>
                    <input type="number" name="ft_cellar" [(ngModel)]="ft.cellar" placeholder="0" min="0"/>
                  </div>

                  <div class="field">
                    <label>Anno costruzione</label>
                    <input type="number" name="ft_year" [(ngModel)]="ft.year" placeholder="2024" min="1900" max="2100"/>
                  </div>

                  <div class="field">
                    <label>Classe energetica</label>
                    <select name="ft_energy" [(ngModel)]="ft.energy_class">
                      <option value="">— non specificata —</option>
                      <option>A4</option>
                      <option>A3</option>
                      <option>A2</option>
                      <option>A1</option>
                      <option>B</option>
                      <option>C</option>
                      <option>D</option>
                      <option>E</option>
                      <option>F</option>
                      <option>G</option>
                    </select>
                  </div>

                  <div class="field">
                    <label>Riscaldamento</label>
                    <select name="ft_heating" [(ngModel)]="ft.heating">
                      <option value="">— non specificato —</option>
                      <option value="Centralizzato">Centralizzato</option>
                      <option value="Autonomo">Autonomo</option>
                      <option value="Teleriscaldamento">Teleriscaldamento</option>
                      <option value="Pompa di calore">Pompa di calore</option>
                      <option value="Assente">Assente</option>
                    </select>
                  </div>
                </div>

                <div class="features-toggles">
                  <button type="button" class="toggle-row" (click)="ft.elevator = !ft.elevator">
                    <span class="ft-toggle-label">Ascensore</span>
                    <span class="toggle" [class.on]="ft.elevator">
                      <span class="toggle-thumb"></span>
                    </span>
                  </button>

                  <button type="button" class="toggle-row" (click)="ft.air_conditioning = !ft.air_conditioning">
                    <span class="ft-toggle-label">Aria condizionata</span>
                    <span class="toggle" [class.on]="ft.air_conditioning">
                      <span class="toggle-thumb"></span>
                    </span>
                  </button>
                </div>
              </div>

              <div class="card">
                <h2>Metadata JSON</h2>

                <div class="field">
                  <textarea
                    name="meta"
                    [(ngModel)]="formMeta"
                    rows="6"
                    placeholder='{"category":"luxury","city":"Roma","price":"€ 1.250.000"}'
                    [class.input-error]="metaError()"
                    (blur)="validateMeta()"
                  ></textarea>

                  @if (metaError()) {
                    <span class="error-msg">JSON non valido — controlla la sintassi</span>
                  } @else {
                    <span class="field-hint">Dati aggiuntivi opzionali in formato JSON</span>
                  }
                </div>
              </div>
            </div>

            <div class="form-side">
              <div class="card">
                <h2>Pubblicazione</h2>

                <button type="button" class="toggle-row" (click)="formPublished = !formPublished">
                  <span>
                    <span class="toggle-label">{{ formPublished ? 'Pubblicata' : 'Bozza' }}</span>
                    <span class="toggle-desc">{{ formPublished ? 'Visibile via API' : 'Solo admin' }}</span>
                  </span>

                  <span class="toggle" [class.on]="formPublished">
                    <span class="toggle-thumb"></span>
                  </span>
                </button>
              </div>

              <div class="card images-card">
                <h2>
                  Immagini
                  @if (images().length > 0) {
                    <span class="badge">{{ images().length }}</span>
                  }
                </h2>

                <p class="field-hint image-help">
                  Inserisci una immagine alla volta. Dopo ogni inserimento puoi cambiare l’ordine con i pulsanti.
                </p>

                @if (images().length > 0) {
                  <div class="images-list">
                    @for (item of images(); track item.id; let i = $index) {
                      <div class="image-item" [class.selected]="selectedImageIndex() === i">
                        <button type="button" class="image-preview-button" (click)="selectedImageIndex.set(i)">
                          <span class="image-number">{{ i + 1 }}</span>
                          <img [src]="item.url" [alt]="'Immagine ' + (i + 1)"/>
                        </button>

                        <div class="image-info">
                          <strong>
                            {{ item.type === 'new' ? 'Nuova immagine' : 'Immagine salvata' }}
                          </strong>

                          <small>
                            {{ item.type === 'new' ? item.file?.name : item.image?.url }}
                          </small>

                          <div class="image-actions">
                            <button type="button" class="mini-btn" (click)="moveImageUp(i)" [disabled]="i === 0">
                              ↑
                            </button>

                            <button
                              type="button"
                              class="mini-btn"
                              (click)="moveImageDown(i)"
                              [disabled]="i === images().length - 1"
                            >
                              ↓
                            </button>

                            <button type="button" class="mini-btn danger" (click)="removeImage(i)">
                              Rimuovi
                            </button>
                          </div>
                        </div>
                      </div>
                    }
                  </div>

                  <div class="large-preview">
                    @if (selectedImage(); as selected) {
                      <img [src]="selected.url" alt="Anteprima immagine selezionata"/>
                    }
                    <div class="large-preview-caption">
                      Anteprima immagine {{ selectedImageIndex() + 1 }} di {{ images().length }}
                    </div>
                  </div>
                } @else {
                  <div class="empty-images">
                    Nessuna immagine inserita.
                  </div>
                }

                <div class="add-image-box">
                  <input
                    #fileInput
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    (change)="onSingleFileChange($event)"
                    hidden
                  />

                  <button type="button" class="btn-add-image" (click)="fileInput.click()">
                    {{ images().length === 0 ? 'Inserisci prima immagine' : 'Inserisci immagine successiva' }}
                  </button>

                  <small>JPG, PNG, WEBP, GIF — max 10 MB.</small>
                </div>

                @if (uploadError()) {
                  <div class="upload-error">{{ uploadError() }}</div>
                }
              </div>
            </div>
          </div>

          <div class="actions-bar">
            <div class="actions-left">
              @if (isEdit()) {
                <span class="last-updated">Ultima modifica: {{ lastUpdated() }}</span>
              }
            </div>

            <div class="actions-right">
              <a routerLink="/sections" class="btn-secondary">Annulla</a>

              <button type="submit" class="btn-primary" [disabled]="saving() || f.invalid">
                @if (saving()) {
                  <span class="spinner-sm"></span>
                  Salvataggio...
                } @else if (isEdit()) {
                  Salva modifiche
                } @else {
                  Crea sezione
                }
              </button>
            </div>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .page {
      max-width: 1180px;
      animation: fadeIn 0.3s ease;
    }

    .page-header {
      margin-bottom: 32px;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 10px;
    }

    .breadcrumb a {
      color: var(--accent);
    }

    .breadcrumb a:hover {
      text-decoration: underline;
    }

    .sep {
      opacity: 0.4;
    }

    h1 {
      font-family: var(--font-serif);
      font-size: 28px;
      font-weight: 400;
      color: var(--text-primary);
    }

    .form-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 420px;
      gap: 20px;
      margin-bottom: 20px;
    }

    @media (max-width: 980px) {
      .form-layout {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 24px;
      margin-bottom: 20px;
    }

    .card:last-child {
      margin-bottom: 0;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-primary);
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 20px;
    }

    h2 svg {
      width: 16px;
      height: 16px;
      color: var(--text-muted);
    }

    .field {
      margin-bottom: 18px;
    }

    .field:last-child {
      margin-bottom: 0;
    }

    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 18px;
    }

    @media (max-width: 600px) {
      .field-row {
        grid-template-columns: 1fr;
      }
    }

    label {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 7px;
    }

    .req {
      color: var(--red);
    }

    .label-hint,
    .field-hint {
      color: var(--text-muted);
      font-size: 12px;
      font-weight: 400;
    }

    .field-hint {
      display: block;
      margin-top: 5px;
    }

    .char-count {
      margin-left: auto;
      color: var(--text-muted);
      font-size: 12px;
      font-weight: 400;
    }

    input,
    textarea,
    select {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 11px 14px;
      color: var(--text-primary);
      font-size: 14px;
      font-family: var(--font-sans);
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    select {
      background-color: #1f2937;
      color: #f9fafb;
    }

    textarea {
      resize: vertical;
    }

    input:focus,
    textarea:focus,
    select:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(62, 207, 142, 0.12);
    }

    input.readonly {
      opacity: 0.5;
      cursor: not-allowed;
      background: rgba(255, 255, 255, 0.02);
    }

    .input-error {
      border-color: var(--red);
    }

    .error-msg {
      display: block;
      color: #fca5a5;
      font-size: 12px;
      margin-top: 5px;
    }

    .input-unit {
      display: flex;
    }

    .input-unit input {
      border-radius: var(--radius-sm) 0 0 var(--radius-sm);
      border-right: none;
    }

    .unit {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      padding: 11px 12px;
      color: var(--text-muted);
      font-size: 13px;
      white-space: nowrap;
      line-height: 1.5;
    }

    .features-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 16px;
    }

    @media (max-width: 500px) {
      .features-grid {
        grid-template-columns: 1fr;
      }
    }

    .features-toggles {
      margin-top: 4px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .toggle-row {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      cursor: pointer;
      padding: 8px 0;
      background: transparent;
      border: none;
      text-align: left;
      font-family: var(--font-sans);
    }

    .ft-toggle-label,
    .toggle-label {
      color: var(--text-primary);
      font-size: 14px;
      font-weight: 500;
    }

    .toggle-label {
      display: block;
      margin-bottom: 3px;
    }

    .toggle-desc {
      color: var(--text-secondary);
      font-size: 12px;
    }

    .toggle {
      width: 46px;
      height: 26px;
      flex-shrink: 0;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 13px;
      position: relative;
      transition: background 0.25s;
    }

    .toggle.on {
      background: var(--accent);
    }

    .toggle-thumb {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 20px;
      height: 20px;
      background: #fff;
      border-radius: 50%;
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    }

    .toggle.on .toggle-thumb {
      transform: translateX(20px);
    }

    .badge {
      margin-left: auto;
      background: var(--accent);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 10px;
    }

    .images-card {
      position: sticky;
      top: 20px;
    }

    .image-help {
      margin-bottom: 16px;
      line-height: 1.45;
    }

    .images-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 18px;
      max-height: 420px;
      overflow: auto;
      padding-right: 4px;
    }

    .image-item {
      display: grid;
      grid-template-columns: 96px 1fr;
      gap: 12px;
      border: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.035);
      border-radius: var(--radius-sm);
      padding: 10px;
      transition: border-color 0.2s, background 0.2s;
    }

    .image-item.selected {
      border-color: var(--accent);
      background: rgba(62, 207, 142, 0.08);
    }

    .image-preview-button {
      position: relative;
      width: 96px;
      height: 76px;
      padding: 0;
      border: 0;
      border-radius: var(--radius-sm);
      overflow: hidden;
      background: rgba(255, 255, 255, 0.06);
      cursor: pointer;
    }

    .image-preview-button img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .image-number {
      position: absolute;
      top: 6px;
      left: 6px;
      z-index: 1;
      min-width: 22px;
      height: 22px;
      padding: 0 6px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.72);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
    }

    .image-info {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .image-info strong {
      color: var(--text-primary);
      font-size: 13px;
    }

    .image-info small {
      color: var(--text-muted);
      font-size: 11px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .image-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: auto;
    }

    .mini-btn {
      border: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-primary);
      border-radius: 8px;
      padding: 6px 9px;
      font-size: 12px;
      cursor: pointer;
      font-family: var(--font-sans);
    }

    .mini-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
    }

    .mini-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .mini-btn.danger {
      color: #fca5a5;
      border-color: rgba(239, 68, 68, 0.35);
    }

    .large-preview {
      margin-bottom: 18px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      background: rgba(255, 255, 255, 0.035);
    }

    .large-preview img {
      width: 100%;
      height: 280px;
      display: block;
      object-fit: contain;
      background: rgba(0, 0, 0, 0.2);
    }

    .large-preview-caption {
      padding: 10px 12px;
      color: var(--text-secondary);
      font-size: 12px;
      border-top: 1px solid var(--border);
    }

    .empty-images {
      border: 1px dashed var(--border);
      border-radius: var(--radius);
      padding: 28px 18px;
      color: var(--text-muted);
      text-align: center;
      font-size: 13px;
      margin-bottom: 18px;
    }

    .add-image-box {
      border: 1px dashed var(--border);
      border-radius: var(--radius);
      padding: 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .btn-add-image {
      width: 100%;
      padding: 12px 16px;
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 700;
      font-family: var(--font-sans);
      cursor: pointer;
    }

    .btn-add-image:hover {
      background: var(--accent-hover);
    }

    .add-image-box small {
      color: var(--text-muted);
      font-size: 12px;
    }

    .upload-error {
      background: var(--red-light);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #fca5a5;
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      margin-top: 10px;
    }

    .actions-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 18px 24px;
    }

    .actions-left {
      color: var(--text-muted);
      font-size: 13px;
    }

    .actions-right {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .btn-secondary {
      padding: 11px 22px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: 14px;
      font-family: var(--font-sans);
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s;
      display: inline-flex;
      align-items: center;
    }

    .btn-secondary:hover {
      background: var(--bg-card-hover);
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 11px 22px;
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 600;
      font-family: var(--font-sans);
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--accent-hover);
    }

    .btn-primary:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .spinner-sm {
      width: 15px;
      height: 15px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.65s linear infinite;
    }

    .state-box {
      text-align: center;
      padding: 80px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .spinner-lg {
      width: 36px;
      height: 36px;
      border: 3px solid var(--accent-light);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .state-box p {
      color: var(--text-secondary);
      font-size: 14px;
    }

    @media (max-width: 520px) {
      .image-item {
        grid-template-columns: 80px 1fr;
      }

      .image-preview-button {
        width: 80px;
        height: 68px;
      }

      .large-preview img {
        height: 220px;
      }

      .actions-bar {
        flex-direction: column;
        align-items: stretch;
      }

      .actions-right {
        width: 100%;
      }

      .btn-secondary,
      .btn-primary {
        flex: 1;
        justify-content: center;
      }
    }
  `],
})
export class SectionFormComponent implements OnInit {
  readonly key = input<string>('');

  private svc = inject(SectionsService);
  private router = inject(Router);
  private toast = inject(ToastService);

  isEdit = computed(() => !!this.key());

  formKey = '';
  formSlug = '';
  formTitle = '';
  formDescription = '';
  formAddress = '';
  formStatus = '';
  formMeta = '';
  formPublished = true;
  ft: FeaturesForm = { ...EMPTY_FEATURES };

  loadingSection = signal(false);
  saving = signal(false);
  metaError = signal(false);
  uploadError = signal('');
  lastUpdated = signal('');

  images = signal<ImageFormItem[]>([]);
  selectedImageIndex = signal(0);

  selectedImage = computed(() => {
    const list = this.images();
    return list[this.selectedImageIndex()] ?? list[0] ?? null;
  });

  ngOnInit() {
    if (this.isEdit()) {
      this.loadSection();
    }
  }

  loadSection() {
    this.loadingSection.set(true);

    this.svc.getByKey(this.key()).subscribe({
      next: (s: Section) => {
        this.formKey = s.key;
        this.formSlug = s.slug ?? '';
        this.formTitle = s.title ?? '';
        this.formDescription = s.description ?? '';
        this.formAddress = s.address ?? '';
        this.formStatus = s.status ?? '';
        this.formMeta = s.meta ? JSON.stringify(s.meta, null, 2) : '';
        this.formPublished = s.is_published;
        this.lastUpdated.set(new Date(s.updated_at).toLocaleString('it-IT'));
        this.ft = this.parseFeaturesFromApi(s.features);

        this.images.set(
          (s.images ?? []).map((img, index) => ({
            id: `existing-${index}-${img.url}`,
            type: 'existing',
            url: img.url,
            image: img,
          }))
        );

        this.selectedImageIndex.set(0);
        this.loadingSection.set(false);
      },
      error: () => {
        this.toast.error('Sezione non trovata');
        this.router.navigate(['/sections']);
      },
    });
  }

  validateMeta(): boolean {
    if (!this.formMeta.trim()) {
      this.metaError.set(false);
      return true;
    }

    try {
      JSON.parse(this.formMeta);
      this.metaError.set(false);
      return true;
    } catch {
      this.metaError.set(true);
      return false;
    }
  }

  onSingleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.handleSingleFile(file);
    input.value = '';
  }

  private handleSingleFile(file: File) {
    this.uploadError.set('');

    if (!file.type.startsWith('image/')) {
      this.uploadError.set(`${file.name}: formato non supportato`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.uploadError.set(`${file.name}: troppo grande, massimo 10 MB`);
      return;
    }

    const reader = new FileReader();

    reader.onload = event => {
      const url = String(event.target?.result ?? '');

      this.images.update(list => {
        const next = [
          ...list,
          {
            id: `new-${Date.now()}-${file.name}`,
            type: 'new' as const,
            url,
            file,
          },
        ];

        this.selectedImageIndex.set(next.length - 1);
        return next;
      });
    };

    reader.readAsDataURL(file);
  }

  moveImageUp(index: number) {
    if (index <= 0) return;

    this.images.update(list => {
      const next = [...list];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });

    this.selectedImageIndex.set(index - 1);
  }

  moveImageDown(index: number) {
    const list = this.images();

    if (index >= list.length - 1) return;

    this.images.update(current => {
      const next = [...current];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });

    this.selectedImageIndex.set(index + 1);
  }

  removeImage(index: number) {
    this.images.update(list => list.filter((_, i) => i !== index));

    const nextLength = this.images().length;

    if (nextLength === 0) {
      this.selectedImageIndex.set(0);
      return;
    }

    this.selectedImageIndex.set(Math.min(index, nextLength - 1));
  }

  submit() {
    if (!this.validateMeta()) return;

    this.saving.set(true);
    this.uploadError.set('');

    const fd = new FormData();

    if (!this.isEdit()) {
      fd.append('key', this.formKey);
    }

    fd.append('slug', this.formSlug || this.formKey);

    if (this.formTitle) fd.append('title', this.formTitle);
    if (this.formDescription) fd.append('description', this.formDescription);
    if (this.formAddress) fd.append('address', this.formAddress);
    if (this.formStatus) fd.append('status', this.formStatus);
    if (this.formMeta.trim()) fd.append('meta', this.formMeta.trim());

    fd.append('is_published', String(this.formPublished));

    const featuresJson = this.buildFeaturesJson();

    if (featuresJson) {
      fd.append('features', featuresJson);
    }

    const orderedExistingImages = this.images()
      .filter(item => item.type === 'existing')
      .map(item => item.image)
      .filter((img): img is SectionImage => !!img);

    const orderedNewImages = this.images()
      .filter(item => item.type === 'new')
      .map(item => item.file)
      .filter((file): file is File => !!file);

    if (this.isEdit()) {
      fd.append('existing_images', JSON.stringify(orderedExistingImages));
    }

    for (const file of orderedNewImages) {
      fd.append('images', file);
    }

    /**
     * Campo opzionale utile se il backend vuole salvare l'ordine misto
     * tra immagini già esistenti e nuove immagini.
     */
    fd.append(
      'image_order',
      JSON.stringify(
        this.images().map(item => ({
          type: item.type,
          url: item.type === 'existing' ? item.image?.url : null,
          file_name: item.type === 'new' ? item.file?.name : null,
        }))
      )
    );

    const req$ = this.isEdit()
      ? this.svc.update(this.key(), fd)
      : this.svc.create(fd);

    req$.subscribe({
      next: s => {
        this.saving.set(false);

        this.toast.success(
          this.isEdit()
            ? `Sezione "${s.key}" aggiornata!`
            : `Sezione "${s.key}" creata!`
        );

        this.router.navigate(['/sections']);
      },
      error: e => {
        const msg = e.error?.detail ?? 'Errore durante il salvataggio';
        this.toast.error(typeof msg === 'string' ? msg : 'Errore durante il salvataggio');
        this.saving.set(false);
      },
    });
  }

  private parseFeaturesFromApi(raw: Record<string, unknown> | null): FeaturesForm {
    if (!raw) return { ...EMPTY_FEATURES };

    const extractNum = (v: unknown): number | null => {
      if (v == null) return null;
      const n = Number(String(v).replace(/[^\d.]/g, ''));
      return Number.isNaN(n) ? null : n;
    };

    return {
      surface: extractNum(raw['surface']),
      floor: (raw['floor'] as string) ?? '',
      rooms: extractNum(raw['rooms']),
      bedrooms: extractNum(raw['bedrooms']),
      bathrooms: extractNum(raw['bathrooms']),
      parking: extractNum(raw['parking']),
      balcony: extractNum(raw['balcony']),
      terrace: extractNum(raw['terrace']),
      cellar: extractNum(raw['cellar']),
      year: raw['year'] != null ? Number(raw['year']) : null,
      energy_class: (raw['energy_class'] as string) ?? '',
      heating: (raw['heating'] as string) ?? '',
      elevator: !!raw['elevator'],
      air_conditioning: !!raw['air_conditioning'],
    };
  }

  private buildFeaturesJson(): string | null {
    const f = this.ft;
    const obj: Record<string, unknown> = {};

    if (f.surface) obj['surface'] = f.surface;
    if (f.floor) obj['floor'] = f.floor;
    if (f.rooms) obj['rooms'] = f.rooms;
    if (f.bedrooms) obj['bedrooms'] = f.bedrooms;
    if (f.bathrooms) obj['bathrooms'] = f.bathrooms;
    if (f.balcony) obj['balcony'] = f.balcony;
    if (f.terrace) obj['terrace'] = f.terrace;
    if (f.cellar) obj['cellar'] = f.cellar;
    if (f.parking) obj['parking'] = f.parking;
    if (f.year) obj['year'] = f.year;
    if (f.energy_class) obj['energy_class'] = f.energy_class;
    if (f.heating) obj['heating'] = f.heating;

    obj['elevator'] = f.elevator;
    obj['air_conditioning'] = f.air_conditioning;

    const icons: { icon: string; label: string }[] = [];

    if (f.surface) icons.push({ icon: 'area', label: `${f.surface} m²` });
    if (f.rooms) icons.push({ icon: 'rooms', label: `${f.rooms} local${f.rooms === 1 ? 'e' : 'i'}` });
    if (f.floor) icons.push({ icon: 'floor', label: f.floor });
    if (f.bedrooms) icons.push({ icon: 'bed', label: `${f.bedrooms} camer${f.bedrooms === 1 ? 'a' : 'e'}` });
    if (f.bathrooms) icons.push({ icon: 'bath', label: `${f.bathrooms} bagn${f.bathrooms === 1 ? 'o' : 'i'}` });
    if (f.balcony) icons.push({ icon: 'balcony', label: `${f.balcony} balcon${f.balcony === 1 ? 'e' : 'i'}` });
    if (f.terrace) icons.push({ icon: 'balcony', label: `${f.terrace} terrazz${f.terrace === 1 ? 'a' : 'e'}` });
    if (f.cellar) icons.push({ icon: 'cellar', label: `${f.cellar} cantin${f.cellar === 1 ? 'a' : 'e'}` });
    if (f.parking) icons.push({ icon: 'parking', label: `${f.parking} post${f.parking === 1 ? 'o' : 'i'} auto` });
    if (f.energy_class) icons.push({ icon: 'energy', label: `Classe ${f.energy_class}` });

    if (icons.length) {
      obj['icons'] = icons;
    }

    const hasContent = Object.keys(obj).some(
      key => key !== 'elevator' && key !== 'air_conditioning' && !!obj[key]
    );

    if (!hasContent && !f.elevator && !f.air_conditioning) {
      return null;
    }

    return JSON.stringify(obj);
  }
}
