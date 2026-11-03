import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatConversationItem, ChatMessageItem } from '../../../core/models/models';
import { UserAvatarComponent } from '../../../shared/components/common-badges.component';
import { CodeSnippetComponent } from '../../../shared/components/code-snippet.component';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, UserAvatarComponent],
  template: `
    <div class="w-80 border-r border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#111827] flex flex-col h-full select-none">
      <!-- Search & Channels Header -->
      <div class="p-4 border-b border-slate-200 dark:border-[#1e293b]">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-cyan-500 text-[18px]">forum</span>
            <span>Messages & Channels</span>
          </h2>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 font-semibold">SignalR</span>
        </div>

        <div class="relative">
          <span class="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-[16px]">search</span>
          <input
            type="text"
            [(ngModel)]="search"
            placeholder="Search channels & developers..."
            class="w-full pl-8 pr-3 py-1.5 text-xs font-mono rounded border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0d1117] text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <!-- Conversations Stream -->
      <div class="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-[#1e293b]/50">
        <div
          *ngFor="let c of filteredConversations"
          (click)="select.emit(c)"
          class="p-3.5 flex items-start gap-3 cursor-pointer transition-colors"
          [class.bg-slate-200]="selectedId === c.id"
          [class.dark:bg-[#182234]]="selectedId === c.id"
          [class.hover:bg-slate-100]="selectedId !== c.id"
          [class.dark:hover:bg-[#161f30]]="selectedId !== c.id"
        >
          <div class="relative flex-shrink-0">
            <app-user-avatar
              [avatarUrl]="c.avatarUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'"
              [displayName]="c.title"
              [size]="36"
              [showStatus]="true"
              [isOnline]="true"
            ></app-user-avatar>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1 mb-1">
              <span class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ c.title }}</span>
              <span class="text-[10px] font-mono text-slate-400">{{ c.updatedAt | date:'shortTime' }}</span>
            </div>

            <p class="text-xs text-slate-500 dark:text-slate-400 truncate leading-snug">
              {{ c.lastMessage?.content || c.channelTopic || 'No messages yet' }}
            </p>
          </div>

          <span
            *ngIf="c.unreadCount && c.unreadCount > 0"
            class="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 font-bold text-[9px] flex items-center justify-center flex-shrink-0 mt-1"
          >
            {{ c.unreadCount }}
          </span>
        </div>
      </div>
    </div>
  `
})
export class ChatSidebarComponent {
  @Input() conversations: ChatConversationItem[] = [];
  @Input() selectedId = '';
  @Output() select = new EventEmitter<ChatConversationItem>();

  search = '';

  get filteredConversations(): ChatConversationItem[] {
    if (!this.search.trim()) return this.conversations;
    const q = this.search.toLowerCase();
    return this.conversations.filter(c => c.title.toLowerCase().includes(q));
  }
}

@Component({
  selector: 'app-chat-message-item',
  standalone: true,
  imports: [CommonModule, UserAvatarComponent, CodeSnippetComponent],
  template: `
    <div
      class="flex gap-3 mb-4 group"
      [class.flex-row-reverse]="isSelf"
    >
      <app-user-avatar
        [avatarUrl]="message.senderAvatar"
        [displayName]="message.senderDisplayName"
        [size]="32"
      ></app-user-avatar>

      <div class="max-w-lg flex flex-col" [class.items-end]="isSelf">
        <div class="flex items-center gap-2 mb-1 text-[11px] font-mono text-slate-400">
          <span class="font-bold text-slate-700 dark:text-slate-300">{{ message.senderDisplayName }}</span>
          <span>{{ message.sentAt | date:'shortTime' }}</span>
        </div>

        <!-- Message Bubble -->
        <div
          class="p-3.5 rounded-lg text-xs leading-relaxed"
          [class.bg-cyan-500]="isSelf"
          [class.text-slate-950]="isSelf"
          [class.font-medium]="isSelf"
          [class.bg-slate-100]="!isSelf"
          [class.dark:bg-[#182234]]="!isSelf"
          [class.text-slate-800]="!isSelf"
          [class.dark:text-slate-200]="!isSelf"
          [class.border]="!isSelf"
          [class.border-slate-200]="!isSelf"
          [class.dark:border-[#1e293b]]="!isSelf"
        >
          <p>{{ message.content }}</p>

          <!-- Embedded Code Snippet in Chat -->
          <div *ngIf="message.codeSnippet" class="mt-2 text-left">
            <app-code-snippet
              [code]="message.codeSnippet"
              [language]="message.codeLanguage || 'rust'"
              [showLineNumbers]="false"
            ></app-code-snippet>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ChatMessageItemComponent {
  @Input({ required: true }) message!: ChatMessageItem;
  @Input() currentUsername = 'alexchen';

  get isSelf(): boolean {
    return this.message.senderUsername === this.currentUsername;
  }
}

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 border-t border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827]">
      <!-- Code Drawer Expander if active -->
      <div *ngIf="showCodeInput" class="mb-3 p-3 rounded border border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117]">
        <div class="flex items-center justify-between mb-2 text-xs font-mono">
          <span class="text-cyan-500 font-bold">Attach Code Snippet</span>
          <button (click)="showCodeInput = false" class="text-slate-400 hover:text-white">✕</button>
        </div>
        <textarea
          [(ngModel)]="codeSnippet"
          rows="3"
          placeholder="// Paste snippet..."
          class="w-full p-2 rounded border border-slate-300 dark:border-[#1e293b] bg-white dark:bg-[#111827] text-xs font-mono text-slate-800 dark:text-white focus:outline-none focus:border-cyan-500"
        ></textarea>
      </div>

      <!-- Main Input Bar -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          (click)="showCodeInput = !showCodeInput"
          class="w-9 h-9 rounded border border-slate-200 dark:border-[#1e293b] flex items-center justify-center text-slate-400 hover:text-cyan-500 hover:border-cyan-500/50 transition-colors"
          title="Share Code Snippet"
        >
          <span class="material-symbols-outlined text-[18px]">code</span>
        </button>

        <input
          type="text"
          [(ngModel)]="text"
          (keydown.enter)="send()"
          (input)="onTyping()"
          placeholder="Message #channel or developer... (Press Enter to send)"
          class="flex-1 px-4 py-2 text-xs font-mono rounded border border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
        />

        <button
          type="button"
          (click)="send()"
          [disabled]="!text.trim() && !codeSnippet.trim()"
          class="px-4 py-2 rounded text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 flex items-center gap-1 shadow transition-all"
        >
          <span>Send</span>
          <span class="material-symbols-outlined text-[16px]">send</span>
        </button>
      </div>
    </div>
  `
})
export class ChatInputComponent {
  @Output() onSend = new EventEmitter<{ text: string; codeSnippet?: string }>();
  @Output() typing = new EventEmitter<boolean>();

  text = '';
  codeSnippet = '';
  showCodeInput = false;

  onTyping(): void {
    this.typing.emit(this.text.length > 0);
  }

  send(): void {
    if (!this.text.trim() && !this.codeSnippet.trim()) return;
    this.onSend.emit({
      text: this.text.trim(),
      codeSnippet: this.codeSnippet.trim() || undefined
    });
    this.text = '';
    this.codeSnippet = '';
    this.showCodeInput = false;
    this.typing.emit(false);
  }
}

