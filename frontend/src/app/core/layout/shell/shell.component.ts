import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#0b0f17] text-[#0f172a] dark:text-[#dfe2ee]">
      <!-- Sticky Top Header -->
      <app-header></app-header>

      <!-- Main Body Container -->
      <div class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex">
        <!-- Sidebar Navigation -->
        <app-sidebar></app-sidebar>

        <!-- Dynamic Main Content Pane -->
        <main class="flex-1 py-6 md:pl-6 min-w-0">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class ShellComponent {}

