import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private counter = 0;

  show(message: string, type: ToastType = 'info', duration = 3500) {
    const id = ++this.counter;
    this._toasts.update((list) => [...list, { id, message, type }]);
    setTimeout(() => this.remove(id), duration);
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string) { this.show(msg, 'error', 5000); }
  info(msg: string) { this.show(msg, 'info'); }

  remove(id: number) {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
