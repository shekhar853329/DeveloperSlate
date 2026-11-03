import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell/shell.component';
import { LoginPageComponent } from './features/auth/pages/login-page.component';
import { GithubCallbackPageComponent } from './features/auth/pages/github-callback-page.component';
import { QuestionsPageComponent } from './features/questions/pages/questions-page.component';
import { QuestionDetailPageComponent } from './features/questions/pages/question-detail-page.component';
import { BlogsPageComponent, BlogDetailPageComponent } from './features/blogs/pages/blogs-pages.component';
import { StudioPageComponent } from './features/studio/pages/studio-page.component';
import { TagsPageComponent } from './features/tags/pages/tags-page.component';
import { NotebookPageComponent } from './features/notebook/pages/notebook-page.component';
import { DiffPageComponent } from './features/diff-viewer/pages/diff-page.component';
import { AstPageComponent } from './features/ast-visualizer/pages/ast-page.component';
import { ProfilePageComponent } from './features/profile/pages/profile-page.component';
import { ChatPageComponent } from './features/chat/pages/chat-page.component';
import { RolesPageComponent } from './features/admin/pages/roles-page.component';
import { UsersPageComponent } from './features/admin/pages/users-page.component';
import { AccessDeniedPageComponent } from './features/auth/pages/access-denied-page.component';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'auth/callback', component: GithubCallbackPageComponent },
  // Unguarded — must NOT have canActivate, otherwise the permission guard's
  // fallback redirect creates an infinite navigation loop.
  { path: 'access-denied', component: AccessDeniedPageComponent },
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'questions', pathMatch: 'full' },
      {
        path: 'questions',
        component: QuestionsPageComponent,
        canActivate: [permissionGuard],
        data: { screenKey: 'questions' }
      },
      {
        path: 'questions/:id',
        component: QuestionDetailPageComponent,
        canActivate: [permissionGuard],
        data: { screenKey: 'questions' }
      },
      {
        path: 'blogs',
        component: BlogsPageComponent,
        canActivate: [permissionGuard],
        data: { screenKey: 'blogs' }
      },
      {
        path: 'blogs/:slug',
        component: BlogDetailPageComponent,
        canActivate: [permissionGuard],
        data: { screenKey: 'blogs' }
      },
      {
        path: 'studio',
        component: StudioPageComponent,
        canActivate: [permissionGuard],
        data: { screenKey: 'studio' }
      },
      {
        path: 'tags',
        component: TagsPageComponent,
        canActivate: [permissionGuard],
        data: { screenKey: 'tags' }
      },
      {
        path: 'notebook',
        component: NotebookPageComponent,
        canActivate: [permissionGuard],
        data: { screenKey: 'notebook' }
      },
      {
        path: 'diff',
        component: DiffPageComponent,
        canActivate: [permissionGuard],
        data: { screenKey: 'diff' }
      },
      {
        path: 'ast',
        component: AstPageComponent,
        canActivate: [permissionGuard],
        data: { screenKey: 'ast' }
      },
      {
        path: 'profile',
        component: ProfilePageComponent,
        canActivate: [permissionGuard],
        data: { screenKey: 'profile' }
      },
      {
        path: 'profile/:username',
        component: ProfilePageComponent,
        canActivate: [permissionGuard],
        data: { screenKey: 'profile' }
      },
      {
        path: 'chat',
        component: ChatPageComponent,
        canActivate: [permissionGuard],
        data: { screenKey: 'chat' }
      },
      {
        path: 'admin/roles',
        component: RolesPageComponent,
        canActivate: [permissionGuard],
        data: { screenKey: 'roles-management' }
      },
      {
        path: 'admin/users',
        component: UsersPageComponent,
        canActivate: [permissionGuard],
        data: { screenKey: 'users-management' }
      }
    ]
  },
  { path: '**', redirectTo: 'questions' }
];
