import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeerEndorsementItem } from '../../../core/models/models';

@Component({
  selector: 'app-peer-endorsements',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="endorsements && endorsements.length > 0" class="mb-8">
      <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-[#1e293b]">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-cyan-500 text-[20px]">rate_review</span>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">
            Peer Endorsements & Architectural Reviews
          </h3>
        </div>
        <span class="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20">
          Cryptographically Verified Signatures
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          *ngFor="let endorsement of endorsements"
          class="rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] p-5 shadow-sm hover:border-cyan-500/40 transition-colors flex flex-col justify-between"
        >
          <!-- Review Content Quote -->
          <div class="mb-4">
            <span class="text-cyan-500 text-xl font-serif leading-none block mb-1">“</span>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed pl-2 border-l-2 border-cyan-500/30">
              {{ endorsement.content }}
            </p>
          </div>

          <!-- Author Info -->
          <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#1e293b] gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <img
                [src]="endorsement.authorAvatarUrl"
                [alt]="endorsement.authorName"
                class="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-[#1e293b] flex-shrink-0"
              />
              <div class="min-w-0">
                <span class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block truncate">
                  {{ endorsement.authorName }}
                </span>
                <span class="text-[11px] font-mono text-slate-500 dark:text-slate-400 block truncate">
                  {{ endorsement.authorTitle }}
                </span>
              </div>
            </div>

            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 whitespace-nowrap flex-shrink-0">
              {{ endorsement.verifiedBadge }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PeerEndorsementsComponent {
  @Input() endorsements: PeerEndorsementItem[] = [];
}

