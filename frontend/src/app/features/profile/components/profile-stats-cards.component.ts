import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileDetail } from '../../../core/models/models';

@Component({
  selector: 'app-profile-stats-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="profile" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      <!-- 1. Total Reputation -->
      <div class="p-4 rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Reputation
          </span>
          <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
        </div>
        <div class="my-1">
          <span class="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
            {{ profile.reputation | number }}
          </span>
        </div>
        <div class="flex items-center justify-between text-[11px] font-mono mt-1 pt-2 border-t border-slate-100 dark:border-[#1e293b]/60">
          <span class="text-emerald-500 font-semibold flex items-center">
            ▲ {{ profile.monthlyReputationDelta }}/mo
          </span>
          <span class="text-slate-400">Top 0.5%</span>
        </div>
      </div>

      <!-- 2. Verified Solutions -->
      <div class="p-4 rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Verified Solved
          </span>
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        </div>
        <div class="my-1">
          <span class="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {{ profile.solvedCount }}
          </span>
        </div>
        <div class="flex items-center justify-between text-[11px] font-mono mt-1 pt-2 border-t border-slate-100 dark:border-[#1e293b]/60">
          <span class="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
            Top Tier
          </span>
          <span class="text-slate-400">Rank #3 in Rust</span>
        </div>
      </div>

      <!-- 3. Tech Articles -->
      <div class="p-4 rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Tech Articles
          </span>
          <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
        </div>
        <div class="my-1">
          <span class="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
            {{ profile.articlesCount }}
          </span>
        </div>
        <div class="flex items-center justify-between text-[11px] font-mono mt-1 pt-2 border-t border-slate-100 dark:border-[#1e293b]/60">
          <span class="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20">
            3 RFC Features
          </span>
          <span class="text-slate-400">Peer Reviewed</span>
        </div>
      </div>

      <!-- 4. Engineering Reach -->
      <div class="p-4 rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Engineering Reach
          </span>
          <span class="w-2 h-2 rounded-full bg-amber-400"></span>
        </div>
        <div class="my-1">
          <span class="text-2xl font-bold font-mono text-amber-500 dark:text-amber-400">
            {{ profile.engineeringReach }}
          </span>
        </div>
        <div class="flex items-center justify-between text-[11px] font-mono mt-1 pt-2 border-t border-slate-100 dark:border-[#1e293b]/60">
          <span class="text-amber-500 font-medium">
            {{ profile.devsHelpedCount | number }} devs helped
          </span>
        </div>
      </div>

      <!-- 5. Bounties Claimed -->
      <div class="p-4 rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] shadow-sm flex flex-col justify-between col-span-2 md:col-span-1">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Bounties Claimed
          </span>
          <span class="w-2 h-2 rounded-full bg-rose-400"></span>
        </div>
        <div class="my-1">
          <span class="text-2xl font-bold font-mono text-rose-500 dark:text-rose-400">
            \${{ profile.bountiesClaimedAmount | number }}
          </span>
        </div>
        <div class="flex items-center justify-between text-[11px] font-mono mt-1 pt-2 border-t border-slate-100 dark:border-[#1e293b]/60">
          <span class="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-500 font-bold border border-rose-500/20">
            {{ profile.bountyPoints | number }} pts
          </span>
          <span class="text-slate-400">100% Payout</span>
        </div>
      </div>
    </div>
  `
})
export class ProfileStatsCardsComponent {
  @Input({ required: true }) profile!: ProfileDetail;
}

