import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="card">

        <div class="header">
          <div class="logo">
            <svg viewBox="0 0 40 40" fill="none">
              <polygon points="20,2 38,12 38,28 20,38 2,28 2,12" stroke="#6366f1" stroke-width="2.5" fill="rgba(99,102,241,0.12)"/>
              <polygon points="20,10 30,16 30,24 20,30 10,24 10,16" fill="#6366f1" opacity="0.6"/>
            </svg>
          </div>
          <h1>CMS Backoffice</h1>
          <p>Accedi per gestire i contenuti del sito</p>
        </div>

        <form (ngSubmit)="submit()" #f="ngForm">

          <div class="field">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              [(ngModel)]="email"
              required
              email
              placeholder="admin@example.com"
              autocomplete="email"
              [disabled]="loading()"
            />
          </div>

          <div class="field">
            <label for="password">Password</label>
            <div class="pw-wrap">
              <input
                id="password"
                [type]="showPw() ? 'text' : 'password'"
                name="password"
                [(ngModel)]="password"
                required
                placeholder="••••••••"
                autocomplete="current-password"
                [disabled]="loading()"
              />
              <button type="button" class="eye-btn" (click)="showPw.set(!showPw())">
                @if (showPw()) {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                } @else {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                }
              </button>
            </div>
          </div>

          @if (errorMsg()) {
            <div class="error-banner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ errorMsg() }}
            </div>
          }

          <button type="submit" class="submit-btn" [disabled]="loading() || !email || !password">
            @if (loading()) {
              <span class="spinner"></span>
              Accesso in corso...
            } @else {
              Accedi
            }
          </button>

        </form>

        <p class="footer-hint">CMS Backend v1.0 — Solo admin autorizzati</p>
      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg);
      background-image:
        radial-gradient(ellipse 60% 50% at 15% 40%, rgba(99,102,241,0.13) 0%, transparent 60%),
        radial-gradient(ellipse 50% 40% at 85% 60%, rgba(168,85,247,0.08) 0%, transparent 60%);
      padding: 24px;
      animation: fadeIn 0.4s ease;
    }
    .card {
      width: 100%;
      max-width: 440px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 48px 40px;
      backdrop-filter: blur(24px);
      box-shadow: var(--shadow);
    }
    .header { text-align: center; margin-bottom: 40px; }
    .logo {
      width: 56px; height: 56px;
      margin: 0 auto 20px;
    }
    .logo svg { width: 100%; height: 100%; }
    h1 {
      font-family: var(--font-serif);
      font-size: 26px;
      font-weight: 400;
      color: var(--text-primary);
      margin-bottom: 8px;
    }
    p { color: var(--text-secondary); font-size: 14px; }
    .field { margin-bottom: 20px; }
    label {
      display: block;
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 8px;
    }
    input {
      width: 100%;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 12px 16px;
      color: var(--text-primary);
      font-size: 15px;
      font-family: var(--font-sans);
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
    }
    input:disabled { opacity: 0.5; cursor: not-allowed; }
    .pw-wrap { position: relative; }
    .pw-wrap input { padding-right: 48px; }
    .eye-btn {
      position: absolute; right: 12px; top: 50%;
      transform: translateY(-50%);
      background: none; border: none;
      color: var(--text-muted); cursor: pointer;
      padding: 4px; display: flex; align-items: center;
      transition: color 0.15s;
    }
    .eye-btn:hover { color: var(--text-secondary); }
    .eye-btn svg { width: 18px; height: 18px; }
    .error-banner {
      display: flex; align-items: center; gap: 10px;
      background: var(--red-light);
      border: 1px solid rgba(239,68,68,0.25);
      color: #fca5a5;
      padding: 12px 16px;
      border-radius: var(--radius-sm);
      font-size: 14px;
      margin-bottom: 20px;
    }
    .error-banner svg { width: 16px; height: 16px; flex-shrink: 0; }
    .submit-btn {
      width: 100%;
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      padding: 14px;
      font-size: 15px;
      font-weight: 600;
      font-family: var(--font-sans);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background 0.2s, transform 0.1s;
      margin-top: 8px;
    }
    .submit-btn:hover:not(:disabled) { background: var(--accent-hover); }
    .submit-btn:active:not(:disabled) { transform: scale(0.99); }
    .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }
    .spinner {
      width: 17px; height: 17px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.65s linear infinite;
    }
    .footer-hint {
      text-align: center;
      color: var(--text-muted);
      font-size: 12px;
      margin-top: 28px;
    }
  `],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  email = '';
  password = '';
  loading = signal(false);
  errorMsg = signal('');
  showPw = signal(false);

  submit() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.toast.success('Benvenuto!');
        this.router.navigate(['/']);
      },
      error: (e) => {
        const detail = e.error?.detail;
        this.errorMsg.set(
          typeof detail === 'string' ? detail : 'Email o password non corretti'
        );
        this.loading.set(false);
      },
    });
  }
}
