import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { SignalrChatService } from '../../../core/services/signalr-chat.service';
import { ChatConversationItem, ChatMessageItem } from '../../../core/models/models';
import { ChatSidebarComponent, ChatMessageItemComponent, ChatInputComponent } from '../components/chat-components';
import { UserAvatarComponent } from '../../../shared/components/common-badges.component';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, ChatSidebarComponent, ChatMessageItemComponent, ChatInputComponent, UserAvatarComponent],
  template: `
    <div class="h-[calc(100vh-6rem)] flex rounded-lg border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] overflow-hidden shadow-sm">
      <!-- Chat Channels & Direct Conversations Sidebar -->
      <app-chat-sidebar
        [conversations]="conversations"
        [selectedId]="activeConversation?.id || ''"
        (select)="selectConversation($event)"
      ></app-chat-sidebar>

      <!-- Active Chat Stream Pane -->
      <div *ngIf="activeConversation; else selectConversationState" class="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-[#0b0f17]">
        <!-- Thread Header -->
        <div class="px-6 py-3.5 border-b border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] flex items-center justify-between">
          <div class="flex items-center gap-3">
            <app-user-avatar
              [avatarUrl]="activeConversation.avatarUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'"
              [displayName]="activeConversation.title"
              [size]="36"
              [showStatus]="true"
              [isOnline]="true"
            ></app-user-avatar>
            <div>
              <h2 class="text-sm font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                <span>{{ activeConversation.title }}</span>
                <span *ngIf="activeConversation.isGroup" class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400">
                  GROUP
                </span>
              </h2>
              <span class="text-xs text-slate-400 font-mono">
                {{ activeConversation.channelTopic || (otherParticipant ? otherParticipant.title : 'Active now') }}
              </span>
            </div>
          </div>

          <!-- SignalR Presence Telemetry -->
          <div class="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span class="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Encrypted WebSocket</span>
            </span>
          </div>
        </div>

        <!-- Messages Stream -->
        <div #scrollContainer class="flex-1 overflow-y-auto p-6 space-y-4">
          <app-chat-message-item
            *ngFor="let msg of messages"
            [message]="msg"
            currentUsername="alexchen"
          ></app-chat-message-item>

          <!-- Typing Indicator -->
          <div *ngIf="isOtherTyping" class="flex items-center gap-2 text-xs font-mono text-slate-400 italic">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span>Someone is typing a response...</span>
          </div>
        </div>

        <!-- Input Bar -->
        <app-chat-input
          (onSend)="sendMessage($event)"
          (typing)="onTyping($event)"
        ></app-chat-input>
      </div>

      <ng-template #selectConversationState>
        <div class="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 font-mono">
          <span class="material-symbols-outlined text-5xl mb-2 text-cyan-500">forum</span>
          <p class="text-sm">Select a conversation or engineering channel to start chatting</p>
        </div>
      </ng-template>
    </div>
  `
})
export class ChatPageComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer?: ElementRef;

  private apiService = inject(ApiService);
  private signalrService = inject(SignalrChatService);
  private sub = new Subscription();

  conversations: ChatConversationItem[] = [];
  activeConversation: ChatConversationItem | null = null;
  messages: ChatMessageItem[] = [];
  isOtherTyping = false;

  get otherParticipant(): any {
    return this.activeConversation?.participants?.find(p => p.username !== 'alexchen');
  }

  ngOnInit(): void {
    this.loadConversations();

    // Listen for live messages via SignalR
    this.sub.add(
      this.signalrService.messageReceived$.subscribe(msg => {
        if (this.activeConversation && msg.conversationId === this.activeConversation.id) {
          this.messages.push(msg);
          this.scrollToBottom();
        }
      })
    );

    // Listen for typing notifications
    this.sub.add(
      this.signalrService.userTyping$.subscribe(data => {
        if (data.username !== 'alexchen') {
          this.isOtherTyping = data.isTyping;
          this.scrollToBottom();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    if (this.activeConversation) {
      this.signalrService.leaveConversation(this.activeConversation.id);
    }
  }

  loadConversations(): void {
    this.apiService.getConversations().subscribe(list => {
      this.conversations = list;
      if (list.length > 0) {
        this.selectConversation(list[0]);
      }
    });
  }

  selectConversation(conv: ChatConversationItem): void {
    if (this.activeConversation) {
      this.signalrService.leaveConversation(this.activeConversation.id);
    }

    this.activeConversation = conv;
    this.signalrService.joinConversation(conv.id);

    this.apiService.getMessages(conv.id).subscribe(msgs => {
      this.messages = msgs;
      this.scrollToBottom();
    });
  }

  sendMessage(event: { text: string; codeSnippet?: string }): void {
    if (!this.activeConversation) return;

    this.signalrService.sendMessage(
      this.activeConversation.id,
      'alexchen',
      event.text,
      event.codeSnippet,
      'rust'
    );
  }

  onTyping(isTyping: boolean): void {
    if (!this.activeConversation) return;
    this.signalrService.sendTyping(this.activeConversation.id, 'alexchen', isTyping);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 50);
  }
}

