import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastComponent } from '../../../shared/components/toast.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, RouterLink, RouterLinkActive, ToastComponent],
  template: `
    <div class="layout">

      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="collapsed()">
        <div class="sidebar-top">

          <div class="brand">
            <svg class="brand-logo" viewBox="0 0 40 40" fill="none">
              <polygon points="20,2 38,12 38,28 20,38 2,28 2,12" stroke="#6366f1" stroke-width="2" fill="rgba(99,102,241,0.1)"/>
              <polygon points="20,10 30,16 30,24 20,30 10,24 10,16" fill="#6366f1" opacity="0.7"/>
            </svg>
            @if (!collapsed()) {
              <div class="brand-text">
                <span class="brand-name">CMS</span>
                <span class="brand-sub">Backoffice</span>
              </div>
            }
          </div>

          <button class="collapse-btn" (click)="collapsed.set(!collapsed())" [title]="collapsed() ? 'Espandi' : 'Comprimi'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              @if (collapsed()) {
                <polyline points="9 18 15 12 9 6"/>
              } @else {
                <polyline points="15 18 9 12 15 6"/>
              }
            </svg>
          </button>
        </div>

        <nav class="nav">
          @if (!collapsed()) {
            <span class="nav-label">Contenuti</span>
          }
          <a routerLink="/sections" routerLinkActive="active" class="nav-item" [title]="collapsed() ? 'Sezioni' : ''">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            @if (!collapsed()) { <span>Sezioni</span> }
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="logout-btn" (click)="logout()" [title]="collapsed() ? 'Logout' : ''">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            @if (!collapsed()) { <span>Logout</span> }
          </button>
        </div>
      </aside>

      <!-- Main -->
      <main class="main">
        <router-outlet />
      </main>

    </div>

    <!-- Toast notifications -->
    <app-toast />
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: 100vh;
      background: var(--bg);
    }

    /* ── Sidebar ── */
    .sidebar {
      width: 220px;
      min-width: 220px;
      background: rgba(6,6,12,0.9);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      padding: 20px 12px;
      transition: width 0.25s ease, min-width 0.25s ease;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow: hidden;
    }
    .sidebar.collapsed {
      width: 64px;
      min-width: 64px;
    }
    .sidebar-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
      min-height: 44px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      overflow: hidden;
    }
    .brand-logo { width: 32px; height: 32px; flex-shrink: 0; }
    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
      overflow: hidden;
      white-space: nowrap;
    }
    .brand-name {
      font-family: var(--font-serif);
      font-size: 16px;
      color: var(--text-primary);
    }
    .brand-sub {
      font-size: 11px;
      color: var(--text-muted);
    }
    .collapse-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 6px;
      border-radius: var(--radius-sm);
      display: flex;
      flex-shrink: 0;
      transition: background 0.15s, color 0.15s;
    }
    .collapse-btn:hover { background: var(--bg-card-hover); color: var(--text-primary); }
    .collapse-btn svg { width: 16px; height: 16px; }

    /* ── Nav ── */
    .nav { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .nav-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--text-muted);
      padding: 0 10px;
      margin-bottom: 6px;
      white-space: nowrap;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 500;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .nav-item svg { width: 18px; height: 18px; flex-shrink: 0; }
    .nav-item:hover { background: var(--bg-card-hover); color: var(--text-primary); }
    .nav-item.active { background: var(--accent-light); color: #818cf8; }

    /* ── Footer ── */
    .sidebar-footer { margin-top: auto; }
    .logout-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px;
      background: none;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-size: 14px;
      font-family: var(--font-sans);
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .logout-btn svg { width: 18px; height: 18px; flex-shrink: 0; }
    .logout-btn:hover { background: var(--red-light); color: #fca5a5; border-color: rgba(239,68,68,0.25); }

    /* ── Main ── */
    .main {
      flex: 1;
      overflow-y: auto;
      padding: 36px;
      animation: fadeIn 0.3s ease;
    }
  `],
})
export class LayoutComponent {
  private auth = inject(AuthService);
  collapsed = signal(false);
  logout() { this.auth.logout(); }
}
