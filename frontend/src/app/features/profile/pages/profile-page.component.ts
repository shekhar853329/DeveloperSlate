import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ProfileDetail } from '../../../core/models/models';
import {
  ProfileHeaderComponent,
  ProfileStatsCardsComponent,
  ContributionMatrixComponent,
  ProficienciesComponent,
  ProfileActivityTabsComponent,
  VerifiedSolutionsFeedComponent,
  FeaturedRfcsComponent,
  PeerEndorsementsComponent
} from '../components/profile-components';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    ProfileHeaderComponent,
    ProfileStatsCardsComponent,
    ContributionMatrixComponent,
    ProficienciesComponent,
    ProfileActivityTabsComponent,
    VerifiedSolutionsFeedComponent,
    FeaturedRfcsComponent,
    PeerEndorsementsComponent
  ],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <!-- Loading Skeleton -->
      <div *ngIf="isLoading()" class="space-y-6 animate-pulse">
        <div class="h-48 rounded-xl bg-slate-200 dark:bg-[#111827]"></div>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div *ngFor="let i of [1,2,3,4,5]" class="h-24 rounded-xl bg-slate-200 dark:bg-[#111827]"></div>
        </div>
        <div class="h-64 rounded-xl bg-slate-200 dark:bg-[#111827]"></div>
      </div>

      <!-- Error / Not Found -->
      <div *ngIf="!isLoading() && !profile()" class="p-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#111827]">
        <span class="material-symbols-outlined text-4xl text-slate-400 mb-2 block">person_off</span>
        <h3 class="text-base font-semibold text-slate-700 dark:text-slate-300">Profile not found</h3>
        <p class="text-xs text-slate-500 mt-1 font-mono">This developer profile doesn't exist yet or hasn't been indexed.</p>
      </div>
      <div *ngIf="!isLoading() && profile()" class="transition-opacity duration-300">
        <!-- 1. Developer Metadata Header -->
        <app-profile-header [profile]="profile()!"></app-profile-header>

        <!-- 2. 5 Key Metric Telemetry Tiles -->
        <app-profile-stats-cards [profile]="profile()!"></app-profile-stats-cards>

        <!-- 3. Annual Contribution Matrix Heatmap -->
        <app-contribution-matrix
          [days]="contributions().days"
          [totalEvents]="profile()!.totalContributionEvents"
          [peakHours]="profile()!.peakActivityHours"
          [isDark]="themeService.isDark()"
        ></app-contribution-matrix>

        <!-- 4. Verified System Proficiencies -->
        <app-proficiencies [proficiencies]="profile()!.proficiencies"></app-proficiencies>

        <!-- 5. Activity Filter Tabs -->
        <app-profile-activity-tabs
          [profile]="profile()!"
          [activeTab]="activeTab()"
          (tabChange)="onTabChange($event)"
        ></app-profile-activity-tabs>

        <!-- 6. Tab Content: Verified Solutions Feed -->
        <div *ngIf="activeTab() === 'solutions'">
          <app-verified-solutions-feed
            [solutions]="profile()!.verifiedSolutions"
          ></app-verified-solutions-feed>

          <!-- Featured RFCs -->
          <app-featured-rfcs
            *ngIf="profile()!.featuredRfcs && profile()!.featuredRfcs!.length > 0"
            [rfcs]="profile()!.featuredRfcs!"
          ></app-featured-rfcs>

          <!-- Peer Endorsements -->
          <app-peer-endorsements
            [endorsements]="profile()!.peerEndorsements"
          ></app-peer-endorsements>
        </div>

        <!-- Tab Content: Published Articles & RFCs -->
        <div *ngIf="activeTab() === 'articles' || activeTab() === 'rfcs'">
          <app-featured-rfcs
            [rfcs]="profile()!.featuredRfcs || []"
          ></app-featured-rfcs>
        </div>

        <!-- Tab Content: Questions / Gists fallback -->
        <div *ngIf="activeTab() === 'questions' || activeTab() === 'gists'" class="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-[#1e293b] text-slate-500 font-mono text-xs">
          <span class="material-symbols-outlined text-3xl text-cyan-500 mb-2 block">folder_open</span>
          <span>Syncing real-time {{ activeTab() }} records from PostgreSQL database...</span>
        </div>
      </div>
    </div>
  `
})
export class ProfilePageComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  public themeService = inject(ThemeService);

  profile = signal<ProfileDetail | null>(null);
  contributions = signal<any>({ days: [] });
  isLoading = signal<boolean>(true);
  activeTab = signal<string>('solutions');

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      // Fall back to the currently logged-in user's username, not a hardcoded one
      const username = p['username'] || this.authService.currentUser()?.username || '';

      if (!username) {
        this.isLoading.set(false);
        return;
      }

      this.isLoading.set(true);

      this.apiService.getProfile(username).subscribe({
        next: (prof) => {
          this.profile.set(prof);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });

      this.apiService.getContributions(username).subscribe({
        next: (contribs) => {
          this.contributions.set(contribs);
        },
        error: () => {
          // Contributions are non-critical — show an empty matrix rather than crashing
          this.contributions.set({ days: [], totalContributions: 0, longestStreak: 0, currentStreak: 0, peakHours: '' });
        }
      });
    });
  }

  onTabChange(tab: string): void {
    this.activeTab.set(tab);
  }
}
