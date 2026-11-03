import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'questions/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'blogs/:slug',
    renderMode: RenderMode.Client
  },
  {
    path: 'profile/:username',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
