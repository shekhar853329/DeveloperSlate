import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoleItem, ScreenDefinition, UserWithRolesItem } from '../models/models';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = API_BASE_URL;

  // ── Roles ─────────────────────────────────────────────────────────────────

  getRoles(): Observable<RoleItem[]> {
    return this.http.get<RoleItem[]>(`${this.baseUrl}/roles`);
  }

  getRole(id: string): Observable<RoleItem> {
    return this.http.get<RoleItem>(`${this.baseUrl}/roles/${id}`);
  }

  getAvailableScreens(): Observable<ScreenDefinition[]> {
    return this.http.get<ScreenDefinition[]>(`${this.baseUrl}/roles/screens`);
  }

  createRole(data: {
    name: string;
    description?: string;
    permissions?: { screenKey: string; canRead: boolean; canWrite: boolean }[];
  }): Observable<RoleItem> {
    return this.http.post<RoleItem>(`${this.baseUrl}/roles`, data);
  }

  updateRole(id: string, data: {
    name?: string;
    description?: string;
    permissions?: { screenKey: string; canRead: boolean; canWrite: boolean }[];
  }): Observable<RoleItem> {
    return this.http.put<RoleItem>(`${this.baseUrl}/roles/${id}`, data);
  }

  deleteRole(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/roles/${id}`);
  }

  // ── Users Management ──────────────────────────────────────────────────────

  getUsersWithRoles(search?: string, role?: string): Observable<UserWithRolesItem[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (role) params = params.set('role', role);
    return this.http.get<UserWithRolesItem[]>(`${this.baseUrl}/users`, { params });
  }

  getUserById(id: string): Observable<UserWithRolesItem> {
    return this.http.get<UserWithRolesItem>(`${this.baseUrl}/users/${id}`);
  }

  assignUserRoles(userId: string, roleIds: string[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${userId}/roles`, { roleIds });
  }
}
