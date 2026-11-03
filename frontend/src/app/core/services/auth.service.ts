import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap, catchError, throwError } from 'rxjs';
import { UserSummary } from '../models/models';

export interface AuthResponse {
  token: string;
  user: UserSummary;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private readonly baseUrl = 'http://localhost:5000/api/auth';

  public currentUser = signal<UserSummary | null>(null);
  public authToken = signal<string | null>(null);
  public isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const storedToken = localStorage.getItem('devslate-auth-token');
      const storedUser = localStorage.getItem('devslate-auth-user');

      if (storedToken && storedUser) {
        try {
          this.authToken.set(storedToken);
          this.currentUser.set(JSON.parse(storedUser));
        } catch {
          this.logout();
        }
      } else {
        // Default demo authenticated session as Alex Chen (Obsidian Terminal Maintainer & Admin)
        const demoUser: UserSummary = {
          id: 'alex-id',
          username: 'alexchen',
          displayName: 'Alex Chen',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          reputation: 14840,
          title: 'Principal Systems Engineer',
          roles: ['Admin']
        };
        this.currentUser.set(demoUser);
        this.authToken.set('demo-jwt-token-alexchen');
      }
    }
  }

  public login(usernameOrEmail: string, password: string, rememberMe = true): Observable<AuthResponse> {
    const payload = { usernameOrEmail, password, rememberMe };
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap(res => this.handleAuthSuccess(res, rememberMe)),
      catchError(err => {
        // Offline demo fallback: verify known test accounts
        const lookup = usernameOrEmail.trim().toLowerCase();
        if (
          (lookup === 'alexchen' || lookup === 'alex.chen@kernel.io') ||
          (lookup === 'amaravance' || lookup === 'amara.v@rustaceans.org') ||
          (lookup === 'sophievarma' || lookup === 'sophie@dbperf.io') ||
          (lookup === 'julianchen' || lookup === 'julian@infraops.dev')
        ) {
          const mockUser: UserSummary = lookup.includes('amara')
            ? {
                id: 'amara-id',
                username: 'amaravance',
                displayName: 'Amara Vance',
                avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
                reputation: 3920,
                title: 'Staff Concurrency Engineer'
              }
            : lookup.includes('sophie')
            ? {
                id: 'sophie-id',
                username: 'sophievarma',
                displayName: 'Sophie Varma',
                avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                reputation: 4210,
                title: 'Senior Database Specialist'
              }
            : {
                id: 'alex-id',
                username: 'alexchen',
                displayName: 'Alex Chen',
                avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                reputation: 4850,
                title: 'Principal Systems Engineer'
              };

          const simulated: AuthResponse = {
            token: 'demo-jwt-token-' + mockUser.username,
            user: mockUser
          };
          this.handleAuthSuccess(simulated, rememberMe);
          return of(simulated);
        }

        return throwError(() => err?.error?.message || 'Invalid terminal credentials. Access denied.');
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
      catchError(() => {
        // Offline demo fallback
        const newUser: UserSummary = {
          id: 'user-' + Date.now(),
          username: data.username.trim(),
          displayName: data.displayName || data.username,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          reputation: 100,
          title: data.title || 'Software Engineer'
        };
        const simulated: AuthResponse = {
          token: 'demo-jwt-token-' + newUser.username,
          user: newUser
        };
        this.handleAuthSuccess(simulated, true);
        return of(simulated);
      })
    );
  }

  public loginWithGithub(githubHandle = 'alexchen-dev'): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/github`, { githubHandle }).pipe(
      tap(res => this.handleAuthSuccess(res, true)),
      catchError(() => {
        const githubUser: UserSummary = {
          id: 'alex-id',
          username: 'alexchen',
          displayName: 'Alex Chen',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          reputation: 4850,
          title: 'Principal Systems Engineer'
        };
        const simulated: AuthResponse = {
          token: 'github-oauth-token-alexchen',
          user: githubUser
        };
        this.handleAuthSuccess(simulated, true);
        return of(simulated);
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
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('devslate-auth-token');
      localStorage.removeItem('devslate-auth-user');
    }
    this.router.navigate(['/login']);
  }

  private handleAuthSuccess(res: AuthResponse, rememberMe: boolean): void {
    this.currentUser.set(res.user);
    this.authToken.set(res.token);

    if (isPlatformBrowser(this.platformId) && rememberMe) {
      localStorage.setItem('devslate-auth-token', res.token);
      localStorage.setItem('devslate-auth-user', JSON.stringify(res.user));
    }
  }
}

