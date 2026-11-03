import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { UserSummary } from '../models/models';
import { environment } from '../../../environments/environment';
import { API_BASE_URL } from '../config/api.config';

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserSummary;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private readonly baseUrl = `${API_BASE_URL}/auth`;

  public currentUser = signal<UserSummary | null>(null);
  public authToken = signal<string | null>(null);
  public refreshToken = signal<string | null>(null);
  public isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const storedToken = localStorage.getItem('devslate-auth-token');
      const storedRefresh = localStorage.getItem('devslate-refresh-token');
      const storedUser = localStorage.getItem('devslate-auth-user');

      if (storedToken && storedUser) {
        try {
          this.authToken.set(storedToken);
          this.refreshToken.set(storedRefresh);
          this.currentUser.set(JSON.parse(storedUser));
        } catch {
          this.logout();
        }
      }
      // No session stored → user is not authenticated, must log in
    }
  }

  public login(usernameOrEmail: string, password: string, rememberMe = true): Observable<AuthResponse> {
    const payload = { usernameOrEmail, password, rememberMe };
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap(res => this.handleAuthSuccess(res, rememberMe)),
      catchError(err => {
        return throwError(() => err?.error?.message || 'Invalid credentials. Access denied.');
      })
    );
  }

  public register(data: {
    username: string;
    displayName: string;
    email: string;
    password: string;
    title?: string;
    githubHandle?: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, data).pipe(
      tap(res => this.handleAuthSuccess(res, true)),
      catchError(err => {
        return throwError(() => err?.error?.message || 'Registration failed. Please try again.');
      })
    );
  }

  public loginWithGithub(): void {
    // Redirect the browser to GitHub's OAuth authorization page.
    // GitHub will redirect back to environment.github.redirectUri with ?code=xxx
    const params = new URLSearchParams({
      client_id: environment.github.clientId,
      redirect_uri: environment.github.redirectUri,
      scope: 'read:user user:email',
    });
    window.location.href = `https://github.com/login/oauth/authorize?${params}`;
  }

  public loginWithGithubCode(code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/github/callback`, { code }).pipe(
      tap(res => this.handleAuthSuccess(res, true)),
      catchError(err => {
        return throwError(() => err?.error?.message || 'GitHub login failed.');
      })
    );
  }

  public setCurrentUser(user: UserSummary): void {
    this.currentUser.set(user);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('devslate-auth-user', JSON.stringify(user));
    }
  }

  public logout(): void {
    this.currentUser.set(null);
    this.authToken.set(null);
    this.refreshToken.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('devslate-auth-token');
      localStorage.removeItem('devslate-refresh-token');
      localStorage.removeItem('devslate-auth-user');
    }
    this.router.navigate(['/login']);
  }

  private handleAuthSuccess(res: AuthResponse, rememberMe: boolean): void {
    this.currentUser.set(res.user);
    this.authToken.set(res.token);
    this.refreshToken.set(res.refreshToken);

    if (isPlatformBrowser(this.platformId) && rememberMe) {
      localStorage.setItem('devslate-auth-token', res.token);
      localStorage.setItem('devslate-refresh-token', res.refreshToken);
      localStorage.setItem('devslate-auth-user', JSON.stringify(res.user));
    }
  }
}

