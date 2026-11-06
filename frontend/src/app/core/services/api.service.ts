import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  QuestionItem,
  BlogPostItem,
  TagSummary,
  ProfileDetail,
  ChatConversationItem,
  ChatMessageItem,
  AnswerItem,
  UserSummary
} from '../models/models';
import { API_BASE_URL } from '../config/api.config';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly baseUrl = API_BASE_URL;

  // ── Questions ────────────────────────────────────────────────────────────

  getQuestions(tag?: string, sort?: string, search?: string, isSolved?: boolean): Observable<QuestionItem[]> {
    let params = new HttpParams();
    if (tag) params = params.set('tag', tag);
    if (sort) params = params.set('sort', sort);
    if (search) params = params.set('search', search);
    if (isSolved !== undefined) params = params.set('isSolved', String(isSolved));

    return this.http.get<QuestionItem[]>(`${this.baseUrl}/questions`, { params });
  }

  getQuestionById(id: string): Observable<QuestionItem> {
    return this.http.get<QuestionItem>(`${this.baseUrl}/questions/${id}`);
  }

  createQuestion(data: {
    title: string;
    contentMarkdown: string;
    codeSnippet?: string;
    language?: string;
    tagIds?: string[];
  }): Observable<QuestionItem> {
    return this.http.post<QuestionItem>(`${this.baseUrl}/questions`, data);
  }

  postAnswer(
    questionId: string,
    data: { contentMarkdown: string; codeSnippet?: string; language?: string }
  ): Observable<AnswerItem> {
    return this.http.post<AnswerItem>(`${this.baseUrl}/questions/${questionId}/answers`, data);
  }

  voteQuestion(id: string, delta: number): Observable<{ id: string; upvotes: number; downvotes: number; score: number }> {
    return this.http.post<any>(`${this.baseUrl}/questions/${id}/vote`, {}, {
      params: new HttpParams().set('delta', String(delta))
    });
  }

  // ── Blogs ────────────────────────────────────────────────────────────────

  getBlogs(tag?: string): Observable<BlogPostItem[]> {
    let params = new HttpParams();
    if (tag) params = params.set('tag', tag);
    return this.http.get<BlogPostItem[]>(`${this.baseUrl}/blogs`, { params });
  }

  getBlogBySlug(slug: string): Observable<BlogPostItem> {
    return this.http.get<BlogPostItem>(`${this.baseUrl}/blogs/${slug}`);
  }

  publishBlog(data: {
    title: string;
    subtitle?: string;
    excerpt?: string;
    contentMarkdown: string;
    tags?: string[];
    coverImageUrl?: string;
    canonicalUrl?: string;
  }): Observable<BlogPostItem> {
    return this.http.post<BlogPostItem>(`${this.baseUrl}/blogs`, data);
  }

  clapBlog(id: string): Observable<{ claps: number }> {
    return this.http.post<{ claps: number }>(`${this.baseUrl}/blogs/${id}/clap`, {});
  }

  // ── Tags ─────────────────────────────────────────────────────────────────

  getTags(category?: string, search?: string): Observable<TagSummary[]> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (search) params = params.set('search', search);
    return this.http.get<TagSummary[]>(`${this.baseUrl}/tags`, { params });
  }

  // ── Profile ──────────────────────────────────────────────────────────────

  getProfile(username: string): Observable<ProfileDetail> {
    return this.http.get<ProfileDetail>(`${this.baseUrl}/profile/${username}`);
  }

  getContributions(username: string): Observable<{
    totalContributions: number;
    longestStreak: number;
    currentStreak: number;
    peakHours: string;
    days: { date: string; count: number; level: number }[];
  }> {
    return this.http.get<any>(`${this.baseUrl}/profile/${username}/contributions`);
  }

  // ── Chat ─────────────────────────────────────────────────────────────────

  getConversations(): Observable<ChatConversationItem[]> {
    return this.http.get<ChatConversationItem[]>(`${this.baseUrl}/chat/conversations`);
  }

  getMessages(conversationId: string): Observable<ChatMessageItem[]> {
    return this.http.get<ChatMessageItem[]>(`${this.baseUrl}/chat/conversations/${conversationId}/messages`);
  }

  sendChatMessage(
    conversationId: string,
    content: string,
    codeSnippet?: string,
    codeLanguage?: string
  ): Observable<ChatMessageItem> {
    const payload = { content, codeSnippet, codeLanguage };
    return this.http.post<ChatMessageItem>(
      `${this.baseUrl}/chat/conversations/${conversationId}/messages`,
      payload
    );
  }

  // ── Current user helper ──────────────────────────────────────────────────

  /** Returns the currently authenticated user, or null if not logged in. */
  getCurrentUser(): UserSummary | null {
    return this.auth.currentUser();
  }

  /**
   * @deprecated Use getCurrentUser() which reads from the auth session.
   * Kept for backward compatibility; returns the live authenticated user.
   */
  getCurrentUserSummary(): UserSummary {
    const user = this.auth.currentUser();
    if (!user) {
      throw new Error('No authenticated user. Ensure the user is logged in before calling getCurrentUserSummary().');
    }
    return user;
  }
}
