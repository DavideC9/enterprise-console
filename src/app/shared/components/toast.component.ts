import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import {ToastService} from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-container">
      @for (toast of toastSvc.toasts(); track toast.id) {
        <div class="toast toast-{{ toast.type }}" (click)="toastSvc.remove(toast.id)">
          <span class="toast-icon">
            @if (toast.type === 'success') { ✓ }
            @else if (toast.type === 'error') { ✕ }
            @else { ℹ }
          </span>
          <span>{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px; right: 24px;
      display: flex; flex-direction: column; gap: 10px;
      z-index: 9999;
    }
    .toast {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 18px;
      border-radius: var(--radius);
      font-size: 14px; font-weight: 500;
      cursor: pointer;
      animation: slideIn 0.25s ease;
      box-shadow: var(--shadow);
      border: 1px solid transparent;
      min-width: 260px; max-width: 360px;
    }
    .toast-success {
      background: rgba(22,101,52,0.9);
      border-color: rgba(34,197,94,0.3);
      color: #bbf7d0;
    }
    .toast-error {
      background: rgba(127,29,29,0.9);
      border-color: rgba(239,68,68,0.3);
      color: #fecaca;
    }
    .toast-info {
      background: rgba(30,27,75,0.9);
      border-color: rgba(99,102,241,0.3);
      color: #c7d2fe;
    }
    .toast-icon {
      font-size: 16px; font-weight: 700;
      width: 20px; text-align: center; flex-shrink: 0;
    }
  `],
})
export class ToastComponent {
  toastSvc = inject(ToastService);
}
