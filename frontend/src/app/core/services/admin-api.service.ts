import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { RoleItem, ScreenDefinition, UserWithRolesItem } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5073/api';

  // Roles & Security Administration
  getRoles(): Observable<RoleItem[]> {
    return this.http.get<RoleItem[]>(`${this.baseUrl}/roles`).pipe(
      catchError(() => of(this.getMockRoles()))
    );
  }

  getRole(id: string): Observable<RoleItem> {
    return this.http.get<RoleItem>(`${this.baseUrl}/roles/${id}`).pipe(
      catchError(() => of(this.getMockRoles()[0]))
    );
  }

  getAvailableScreens(): Observable<ScreenDefinition[]> {
    return this.http.get<ScreenDefinition[]>(`${this.baseUrl}/roles/screens`).pipe(
      catchError(() => of(this.getMockScreens()))
    );
  }

  createRole(data: { name: string; description?: string; permissions?: any[] }): Observable<RoleItem> {
    return this.http.post<RoleItem>(`${this.baseUrl}/roles`, data);
  }

  updateRole(id: string, data: { name?: string; description?: string; permissions?: any[] }): Observable<RoleItem> {
    return this.http.put<RoleItem>(`${this.baseUrl}/roles/${id}`, data);
  }

  deleteRole(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/roles/${id}`);
  }

  // Users Management
  getUsersWithRoles(search?: string, role?: string): Observable<UserWithRolesItem[]> {
    let url = `${this.baseUrl}/users?`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (role) url += `role=${encodeURIComponent(role)}&`;
    return this.http.get<UserWithRolesItem[]>(url).pipe(
      catchError(() => of(this.getMockUsersWithRoles()))
    );
  }

  assignUserRoles(userId: string, roleIds: string[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${userId}/roles`, { roleIds });
  }

  private getMockScreens(): ScreenDefinition[] {
    return [
      { key: 'questions', name: 'Problem Explorer & Discussions', category: 'Platform Feeds', description: 'Browse and search technical challenges, answers, and code threads' },
      { key: 'studio', name: 'Publishing Studio (Ask Question)', category: 'Workbench & Tools', description: 'Submit new debugging questions, benchmarks, and code problems' },
      { key: 'blogs', name: 'Engineering Articles & RFCs', category: 'Platform Feeds', description: 'Read technical whitepapers, RFC proposals, and kernel architecture posts' },
      { key: 'blogs-write', name: 'Author Articles & RFCs', category: 'Platform Feeds', description: 'Draft and publish peer-reviewed RFC whitepapers and articles' },
      { key: 'tags', name: 'Technology Directory & Tags', category: 'Platform Feeds', description: 'Explore tag taxonomies, growth metrics, and technologies' },
      { key: 'notebook', name: 'Code Notebook Vault', category: 'Workbench & Tools', description: 'Save and manage reusable code snippets and architectural recipes' },
      { key: 'diff', name: 'Code Diff Viewer', category: 'Workbench & Tools', description: 'Inspect git patch diffs, hunks, and multi-file changes' },
      { key: 'ast', name: 'AST Visualizer', category: 'Workbench & Tools', description: 'Explore AST syntax node trees and parser diagnostics' },
      { key: 'chat', name: 'Live Terminal Channels & DMs', category: 'Real-time & Identity', description: 'Real-time developer chat, SignalR code exchanges, and threads' },
      { key: 'profile', name: 'Developer Profile & Reputation', category: 'Real-time & Identity', description: 'Developer telemetry, verified proficiencies, and endorsements' },
      { key: 'roles-management', name: 'Roles & Screen Permissions', category: 'Administration', description: 'Configure security roles and assign read/write privileges per screen' },
      { key: 'users-management', name: 'User Roles Assignment', category: 'Administration', description: 'Manage registered developers and assign system access roles' }
    ];
  }

  private getMockRoles(): RoleItem[] {
    const screens = this.getMockScreens();
    return [
      {
        id: 'r-admin',
        name: 'Admin',
        description: 'Full administrative access with unrestricted read and write privileges across all platform screens.',
        isSystemRole: true,
        userCount: 1,
        permissions: screens.map(s => ({
          screenKey: s.key,
          screenName: s.name,
          screenCategory: s.category,
          description: s.description,
          canRead: true,
          canWrite: true
        }))
      },
      {
        id: 'r-maintainer',
        name: 'Maintainer',
        description: 'Platform core maintainer with authoring capabilities across feeds, studio, and chat. Read-only on admin panels.',
        isSystemRole: false,
        userCount: 1,
        permissions: screens.map(s => ({
          screenKey: s.key,
          screenName: s.name,
          screenCategory: s.category,
          description: s.description,
          canRead: true,
          canWrite: !['roles-management', 'users-management'].includes(s.key)
        }))
      },
      {
        id: 'r-dev',
        name: 'Developer',
        description: 'Standard authenticated engineer with full participation in discussions, studio, snippets, chat, and profile.',
        isSystemRole: false,
        userCount: 2,
        permissions: screens.map(s => ({
          screenKey: s.key,
          screenName: s.name,
          screenCategory: s.category,
          description: s.description,
          canRead: !['roles-management', 'users-management'].includes(s.key),
          canWrite: ['questions', 'studio', 'notebook', 'chat', 'profile'].includes(s.key)
        }))
      },
      {
        id: 'r-viewer',
        name: 'Viewer',
        description: 'Read-only access for observing problems, articles, tags, diffs, and developer profiles without write privileges.',
        isSystemRole: false,
        userCount: 0,
        permissions: screens.map(s => ({
          screenKey: s.key,
          screenName: s.name,
          screenCategory: s.category,
          description: s.description,
          canRead: ['questions', 'blogs', 'tags', 'diff', 'ast', 'profile'].includes(s.key),
          canWrite: false
        }))
      }
    ];
  }

  private getMockUsersWithRoles(): UserWithRolesItem[] {
    return [
      {
        id: 'alex-id',
        username: 'alexchen',
        displayName: 'Alex Chen',
        email: 'alex.chen@kernel.io',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        title: 'Principal Systems Engineer',
        reputation: 14840,
        solvedCount: 142,
        githubHandle: 'alexchen-dev',
        location: 'San Francisco, CA',
        isOnline: true,
        createdAt: '2023-04-12T00:00:00Z',
        roles: [{ id: 'r-admin', name: 'Admin', isSystemRole: true }]
      },
      {
        id: 'sophie-id',
        username: 'sophievarma',
        displayName: 'Sophie Varma',
        email: 'sophie@dbperf.io',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        title: 'Senior Database Specialist',
        reputation: 4210,
        solvedCount: 78,
        githubHandle: 'sophie-db',
        location: 'Boston, MA',
        isOnline: true,
        createdAt: '2023-05-18T00:00:00Z',
        roles: [{ id: 'r-maintainer', name: 'Maintainer', isSystemRole: false }]
      },
      {
        id: 'amara-id',
        username: 'amaravance',
        displayName: 'Amara Vance',
        email: 'amara.v@rustaceans.org',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        title: 'Staff Concurrency Engineer',
        reputation: 3920,
        solvedCount: 61,
        githubHandle: 'amaravance',
        location: 'Seattle, WA',
        isOnline: true,
        createdAt: '2023-06-22T00:00:00Z',
        roles: [{ id: 'r-dev', name: 'Developer', isSystemRole: false }]
      },
      {
        id: 'julian-id',
        username: 'julianchen',
        displayName: 'Julian Chen',
        email: 'julian@infraops.dev',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        title: 'Lead Infrastructure Architect',
        reputation: 3150,
        solvedCount: 47,
        githubHandle: 'julian-infra',
        location: 'Austin, TX',
        isOnline: false,
        createdAt: '2023-07-09T00:00:00Z',
        roles: [{ id: 'r-dev', name: 'Developer', isSystemRole: false }]
      }
    ];
  }
}

