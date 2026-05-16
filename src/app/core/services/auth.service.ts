import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, TokenResponse, AdminUser } from '../../shared/models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'cms_token';

  // Angular 21: signals-first state
  private _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  readonly isLoggedIn = computed(() => !!this._token());

  login(credentials: LoginRequest) {
    return this.http
      .post<TokenResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((res) => {
          localStorage.setItem(this.TOKEN_KEY, res.access_token);
          this._token.set(res.access_token);
        })
      );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this._token.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  getMe() {
    return this.http.get<AdminUser>(`${environment.apiUrl}/auth/me`);
  }
}
