import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { GeneratedContent } from '../models';
import { BundledContentService } from './bundled-content.service';
import { environment } from '../../environments/environment';

export interface GenerationRequest {
  topic: string;
  depth: 'light' | 'normal';
  language: string;
  userInterests: string[];
  context: {
    date: string;
    locale: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ContentGenerationService {
  private readonly API_TIMEOUT = 30000; // 30 seconds

  constructor(
    private http: HttpClient,
    private bundledContent: BundledContentService
  ) {}

  /**
   * Generate explanation content for a topic.
   *
   * Hybrid strategy:
   *   1. Check bundled content (offline, instant)
   *   2. Call serverless API (custom topics, fresh content)
   *   3. In dev mode, fall back to mock generator
   *   4. In production, surface error to user
   */
  generate(request: GenerationRequest): Observable<GeneratedContent> {
    // Step 1: Check bundled content first (instant, offline) — English only
    if (!request.language || request.language === 'en') {
      const bundled = this.bundledContent.getContent(request.topic);
      if (bundled) {
        return new Observable(observer => {
          setTimeout(() => {
            observer.next(bundled);
            observer.complete();
          }, 300);
        });
      }
    }

    // Step 2: Call serverless API for custom / non-bundled topics
    const headers = new HttpHeaders({
      'x-api-key': environment.apiSecret
    });

    return this.http.post<GeneratedContent>(
      `${environment.apiBaseUrl}/generate`,
      request,
      { headers }
    ).pipe(
      timeout(this.API_TIMEOUT),
      map(response => this.validateResponse(response)),
      catchError(error => {
        console.error('Generation API error:', error);

        // Step 3: In development, fall back to mock
        if (!environment.production) {
          console.warn('API unavailable — falling back to mock generation');
          return this.generateMock(request);
        }

        // Step 4: In production, surface a user-friendly error
        return throwError(() => new Error(
          'Unable to generate content right now. Please check your connection and try again.'
        ));
      })
    );
  }

  // ───────────────────────────────────────────
  // Mock generator (development & testing only)
  // ───────────────────────────────────────────

  /**
   * Mock generator for development and testing
   */
  private generateMock(request: GenerationRequest): Observable<GeneratedContent> {
    return new Observable(observer => {
      setTimeout(() => {
        const content = this.createMockContent(request.topic, request.depth);
        observer.next(content);
        observer.complete();
      }, 1000 + Math.random() * 1000); // 1-2 second delay
    });
  }

  /**
   * Create deterministic mock content based on topic
   */
  private createMockContent(topic: string, depth: 'light' | 'normal'): GeneratedContent {
    const isLight = depth === 'light';
    const hash = this.simpleHash(topic);
    const seed = hash % 10;

    const metaphors = [
      'like a bridge connecting two distant islands',
      'similar to how a seed grows into a tree',
      'like pieces of a puzzle fitting together',
      'comparable to a recipe that creates something new',
      'like a key unlocking a door',
      'similar to how water finds its path downhill',
      'like layers of an onion revealing deeper truth',
      'comparable to how roots anchor a tree',
      'like a lens focusing scattered light',
      'similar to how gears work together in a clock'
    ];

    const examples = [
      'streaming services using recommendation algorithms',
      'smartphone features we use daily without thinking',
      'how coffee shops design their spaces',
      'the way social networks grow and spread',
      'modern architecture in cities',
      'how online shopping changed retail',
      'educational apps for children',
      'renewable energy in communities',
      'food delivery logistics',
      'remote work collaboration tools'
    ];

    const impacts = [
      'reshaping how we make decisions',
      'influencing our daily choices',
      'changing professional landscapes',
      'affecting future generations',
      'transforming industries',
      'creating new opportunities',
      'solving longstanding challenges',
      'connecting people globally',
      'improving quality of life',
      'driving innovation forward'
    ];

    const questions = [
      `How might ${topic} affect your daily life in the next five years?`,
      `What would change if more people understood ${topic}?`,
      `How does ${topic} connect to other things you care about?`,
      `What surprised you most about ${topic}?`,
      `How could you apply ${topic} to a current challenge?`,
      `What assumptions about ${topic} might be worth questioning?`,
      `How has ${topic} evolved over time?`,
      `What makes ${topic} relevant right now?`,
      `How might ${topic} look different in another culture?`,
      `What's one way you could explore ${topic} further?`
    ];

    const baseLength = isLight ? 80 : 120;

    return {
      topic,
      teaser: this.generateTeaser(topic),
      eli7: this.generateParagraph(
        `Think of ${topic} ${metaphors[seed]}. `,
        baseLength,
        `It's something that once you understand it, you'll start noticing it everywhere. The key idea is that it works by connecting different elements in a way that creates something more powerful than the individual parts alone.`
      ),
      deeper: this.generateParagraph(
        `${topic} operates through several interconnected principles. `,
        baseLength + 20,
        `The underlying mechanism involves specific patterns and relationships that emerge when certain conditions are met. Understanding these patterns helps us see why it works the way it does and predict how it might behave in different contexts.`
      ),
      example: this.generateParagraph(
        `Consider ${examples[seed]}. `,
        baseLength,
        `This demonstrates ${topic} in action. The practical application shows how theoretical concepts translate into real-world outcomes that affect people's lives. This example is particularly relevant because it's something many of us encounter regularly.`
      ),
      whyItMatters: this.generateParagraph(
        `${topic} matters today because it's actively ${impacts[seed]}. `,
        baseLength - 20,
        `Beyond immediate applications, understanding this concept equips us to navigate a changing world more effectively. It influences decisions at personal, professional, and societal levels.`
      ),
      reflectionQuestion: questions[seed]
    };
  }

  private generateTeaser(topic: string): string {
    const templates = [
      `Understanding ${topic} changes how you see the world`,
      `Why ${topic} matters more than you think`,
      `The surprising truth about ${topic}`,
      `How ${topic} shapes our daily lives`,
      `${topic} explained simply`,
      `What everyone should know about ${topic}`,
      `The key to understanding ${topic}`,
      `${topic} and why it's relevant today`
    ];

    const hash = this.simpleHash(topic);
    const teaser = templates[hash % templates.length];
    return teaser.length <= 140 ? teaser : teaser.substring(0, 137) + '...';
  }

  private generateParagraph(start: string, targetLength: number, end: string): string {
    const filler = 'This concept is fundamental to understanding how different systems interact and influence each other in complex ways. When we examine it closely, we find patterns that repeat across various domains. These patterns help us make predictions and informed decisions. ';

    let content = start;
    while (content.length < targetLength - end.length) {
      content += filler;
    }
    content += end;
    return content;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // ───────────────────────────────────────────
  // Response validation
  // ───────────────────────────────────────────

  validateResponse(content: any): GeneratedContent {
    const errors: string[] = [];

    if (!content.topic || typeof content.topic !== 'string') {
      errors.push('Missing or invalid topic');
    }
    if (!content.teaser || typeof content.teaser !== 'string') {
      errors.push('Missing or invalid teaser');
    }
    if (!content.eli7 || typeof content.eli7 !== 'string') {
      errors.push('Missing or invalid eli7');
    }
    if (!content.deeper || typeof content.deeper !== 'string') {
      errors.push('Missing or invalid deeper');
    }
    if (!content.example || typeof content.example !== 'string') {
      errors.push('Missing or invalid example');
    }
    if (!content.whyItMatters || typeof content.whyItMatters !== 'string') {
      errors.push('Missing or invalid whyItMatters');
    }
    if (!content.reflectionQuestion || typeof content.reflectionQuestion !== 'string') {
      errors.push('Missing or invalid reflectionQuestion');
    }

    if (content.teaser && content.teaser.length > 140) {
      errors.push('Teaser exceeds 140 characters');
    }

    if (content.reflectionQuestion && !content.reflectionQuestion.trim().endsWith('?')) {
      errors.push('Reflection question must end with ?');
    }

    if (errors.length > 0) {
      throw new Error(`Content validation failed: ${errors.join(', ')}`);
    }

    return content as GeneratedContent;
  }
}
