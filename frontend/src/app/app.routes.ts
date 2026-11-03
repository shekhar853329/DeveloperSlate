import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell/shell.component';
import { LoginPageComponent } from './features/auth/pages/login-page.component';
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

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'questions', pathMatch: 'full' },
      { path: 'questions', component: QuestionsPageComponent },
      { path: 'questions/:id', component: QuestionDetailPageComponent },
      { path: 'blogs', component: BlogsPageComponent },
      { path: 'blogs/:slug', component: BlogDetailPageComponent },
      { path: 'studio', component: StudioPageComponent },
      { path: 'tags', component: TagsPageComponent },
      { path: 'notebook', component: NotebookPageComponent },
      { path: 'diff', component: DiffPageComponent },
      { path: 'ast', component: AstPageComponent },
      { path: 'profile', component: ProfilePageComponent },
      { path: 'profile/:username', component: ProfilePageComponent },
      { path: 'chat', component: ChatPageComponent }
    ]
  },
  { path: '**', redirectTo: 'questions' }
];
