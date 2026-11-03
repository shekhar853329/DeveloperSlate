import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';
import { ChatMessageItem } from '../models/models';
import { SIGNALR_CHAT_HUB_URL } from '../config/api.config';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SignalrChatService {
  private platformId = inject(PLATFORM_ID);
  private auth = inject(AuthService);
  private hubConnection: signalR.HubConnection | null = null;

  public isConnected$ = new BehaviorSubject<boolean>(false);
  public messageReceived$ = new Subject<ChatMessageItem>();
  public userTyping$ = new Subject<{ username: string; isTyping: boolean }>();
  public conversationUpdated$ = new Subject<{ conversationId: string; lastMessage: string; timestamp: string }>();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initConnection();
    }
  }

  private initConnection(): void {
    try {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(SIGNALR_CHAT_HUB_URL, {
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      this.registerHandlers();
      this.startConnection();
    } catch (e) {
      console.warn('SignalR initialization note: Offline mode fallback active.', e);
    }
  }

  private startConnection(): void {
    if (!this.hubConnection) return;

    this.hubConnection
      .start()
      .then(() => {
        this.isConnected$.next(true);
      })
      .catch((err) => {
        // Handled gracefully for local dev when backend is disconnected
        this.isConnected$.next(false);
      });

    this.hubConnection.onreconnecting(() => {
      this.isConnected$.next(false);
    });

    this.hubConnection.onreconnected(() => {
      this.isConnected$.next(true);
    });

    this.hubConnection.onclose(() => {
      this.isConnected$.next(false);
    });
  }

  private registerHandlers(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on('ReceiveMessage', (data: any) => {
      const msg: ChatMessageItem = {
        id: data.id || 'msg-' + Date.now(),
        conversationId: data.conversationId,
        senderId: data.senderId,
        senderUsername: data.senderUsername,
        senderDisplayName: data.senderDisplayName,
        senderAvatar: data.senderAvatar,
        content: data.content,
        codeSnippet: data.codeSnippet,
        codeLanguage: data.codeLanguage,
        sentAt: data.sentAt || new Date().toISOString(),
        isRead: false
      };
      this.messageReceived$.next(msg);
    });

    this.hubConnection.on('UserTyping', (data: { username: string; isTyping: boolean }) => {
      this.userTyping$.next(data);
    });

    this.hubConnection.on('ConversationUpdated', (data: any) => {
      this.conversationUpdated$.next(data);
    });
  }

  public async joinConversation(conversationId: string): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('JoinConversation', conversationId);
      } catch (err) {
        console.warn('SignalR JoinConversation warning:', err);
      }
    }
  }

  public async leaveConversation(conversationId: string): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('LeaveConversation', conversationId);
      } catch (err) {
        console.warn('SignalR LeaveConversation warning:', err);
      }
    }
  }

  public async sendMessage(
    conversationId: string,
    senderUsername: string,
    content: string,
    codeSnippet?: string,
    codeLanguage?: string
  ): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('SendMessage', conversationId, senderUsername, content, codeSnippet || null, codeLanguage || null);
        return;
      } catch (err) {
        console.warn('SignalR SendMessage fallback to local event:', err);
      }
    }

    // Local fallback loopback so UI reacts instantly when SignalR is offline
    const currentUser = this.auth.currentUser();
    const simulated: ChatMessageItem = {
      id: 'local-' + Date.now(),
      conversationId,
      senderId: currentUser?.id ?? '',
      senderUsername: senderUsername,
      senderDisplayName: currentUser?.displayName ?? senderUsername,
      senderAvatar: currentUser?.avatarUrl ?? '',
      content,
      codeSnippet,
      codeLanguage,
      sentAt: new Date().toISOString(),
      isRead: true
    };
    this.messageReceived$.next(simulated);
  }

  public async sendTyping(conversationId: string, username: string, isTyping: boolean): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('SendTyping', conversationId, username, isTyping);
      } catch (err) {
        // silent
      }
    }
  }
}

