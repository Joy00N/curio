import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ContentGenerationService } from './content-generation.service';
import { BundledContentService } from './bundled-content.service';
import { GeneratedContent } from '../models';
import { environment } from '../../environments/environment';

describe('ContentGenerationService', () => {
  let service: ContentGenerationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ContentGenerationService,
        BundledContentService
      ]
    });

    service = TestBed.inject(ContentGenerationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('validateResponse', () => {
    it('should accept valid content', () => {
      const validContent: GeneratedContent = {
        topic: 'Test Topic',
        teaser: 'A test teaser',
        eli7: 'Simple explanation',
        deeper: 'Deeper explanation',
        example: 'Example text',
        whyItMatters: 'Why it matters',
        reflectionQuestion: 'What do you think?'
      };

      expect(() => service.validateResponse(validContent)).not.toThrow();
    });

    it('should reject content with missing topic', () => {
      const invalidContent: any = {
        teaser: 'A test teaser',
        eli7: 'Simple explanation',
        deeper: 'Deeper explanation',
        example: 'Example text',
        whyItMatters: 'Why it matters',
        reflectionQuestion: 'What do you think?'
      };

      expect(() => service.validateResponse(invalidContent)).toThrow();
    });

    it('should reject content with missing reflection question', () => {
      const invalidContent: any = {
        topic: 'Test Topic',
        teaser: 'A test teaser',
        eli7: 'Simple explanation',
        deeper: 'Deeper explanation',
        example: 'Example text',
        whyItMatters: 'Why it matters'
      };

      expect(() => service.validateResponse(invalidContent)).toThrow();
    });

    it('should reject teaser longer than 140 characters', () => {
      const invalidContent: any = {
        topic: 'Test Topic',
        teaser: 'A'.repeat(141),
        eli7: 'Simple explanation',
        deeper: 'Deeper explanation',
        example: 'Example text',
        whyItMatters: 'Why it matters',
        reflectionQuestion: 'What do you think?'
      };

      expect(() => service.validateResponse(invalidContent)).toThrow();
    });

    it('should reject reflection question without question mark', () => {
      const invalidContent: any = {
        topic: 'Test Topic',
        teaser: 'A test teaser',
        eli7: 'Simple explanation',
        deeper: 'Deeper explanation',
        example: 'Example text',
        whyItMatters: 'Why it matters',
        reflectionQuestion: 'Not a question'
      };

      expect(() => service.validateResponse(invalidContent)).toThrow();
    });

    it('should accept teaser at exactly 140 characters', () => {
      const validContent: GeneratedContent = {
        topic: 'Test Topic',
        teaser: 'A'.repeat(140),
        eli7: 'Simple explanation',
        deeper: 'Deeper explanation',
        example: 'Example text',
        whyItMatters: 'Why it matters',
        reflectionQuestion: 'What do you think?'
      };

      expect(() => service.validateResponse(validContent)).not.toThrow();
    });
  });

  describe('generate — bundled content', () => {
    it('should return bundled content instantly for known seed topics', (done) => {
      const request = {
        topic: 'Quantum Computing',
        depth: 'normal' as const,
        userInterests: ['Technology'],
        context: { date: '2026-01-26', locale: 'en-US' }
      };

      service.generate(request).subscribe({
        next: (content) => {
          expect(content.topic).toBe('Quantum Computing');
          expect(content.teaser).toBeTruthy();
          expect(content.eli7).toBeTruthy();
          expect(content.deeper).toBeTruthy();
          expect(content.example).toBeTruthy();
          expect(content.whyItMatters).toBeTruthy();
          expect(content.reflectionQuestion).toBeTruthy();
          done();
        },
        error: done.fail
      });

      // No HTTP request should be made for bundled topics
    });

    it('should return deterministic content for the same bundled topic', (done) => {
      const request = {
        topic: 'Quantum Computing',
        depth: 'normal' as const,
        userInterests: ['Technology'],
        context: { date: '2026-01-26', locale: 'en-US' }
      };

      let firstContent: GeneratedContent;

      service.generate(request).subscribe({
        next: (content) => {
          firstContent = content;

          service.generate(request).subscribe({
            next: (secondContent) => {
              expect(secondContent.topic).toBe(firstContent.topic);
              expect(secondContent.teaser).toBe(firstContent.teaser);
              expect(secondContent.eli7).toBe(firstContent.eli7);
              expect(secondContent.reflectionQuestion).toBe(firstContent.reflectionQuestion);
              done();
            },
            error: done.fail
          });
        },
        error: done.fail
      });
    });
  });

  describe('generate — API fallback for custom topics', () => {
    it('should call the API for non-bundled topics', (done) => {
      const request = {
        topic: 'My Custom Topic',
        depth: 'normal' as const,
        userInterests: ['Technology'],
        context: { date: '2026-01-26', locale: 'en-US' }
      };

      const mockApiResponse: GeneratedContent = {
        topic: 'My Custom Topic',
        teaser: 'A custom teaser',
        eli7: 'Simple custom explanation',
        deeper: 'Deeper custom explanation',
        example: 'Custom example',
        whyItMatters: 'Custom relevance',
        reflectionQuestion: 'What do you think about this?'
      };

      service.generate(request).subscribe({
        next: (content) => {
          expect(content.topic).toBe('My Custom Topic');
          expect(content.teaser).toBe('A custom teaser');
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/generate`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.topic).toBe('My Custom Topic');
      req.flush(mockApiResponse);
    });

    it('should fall back to mock when API fails in dev mode', (done) => {
      const request = {
        topic: 'Another Custom Topic',
        depth: 'normal' as const,
        userInterests: ['Technology'],
        context: { date: '2026-01-26', locale: 'en-US' }
      };

      service.generate(request).subscribe({
        next: (content) => {
          // Mock generator should return content with all required fields
          expect(content.topic).toBeTruthy();
          expect(content.teaser).toBeTruthy();
          expect(content.eli7).toBeTruthy();
          expect(content.deeper).toBeTruthy();
          expect(content.example).toBeTruthy();
          expect(content.whyItMatters).toBeTruthy();
          expect(content.reflectionQuestion).toBeTruthy();
          done();
        },
        error: done.fail
      });

      // Simulate API failure → triggers mock fallback in dev
      const req = httpMock.expectOne(`${environment.apiBaseUrl}/generate`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should generate valid teaser length from mock fallback', (done) => {
      const request = {
        topic: 'Teaser Length Test Topic',
        depth: 'normal' as const,
        userInterests: ['Technology'],
        context: { date: '2026-01-26', locale: 'en-US' }
      };

      service.generate(request).subscribe({
        next: (content) => {
          expect(content.teaser.length).toBeLessThanOrEqual(140);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/generate`);
      req.flush('fail', { status: 500, statusText: 'Error' });
    });

    it('should generate reflection question ending with question mark from mock', (done) => {
      const request = {
        topic: 'Question Mark Test Topic',
        depth: 'normal' as const,
        userInterests: ['Technology'],
        context: { date: '2026-01-26', locale: 'en-US' }
      };

      service.generate(request).subscribe({
        next: (content) => {
          expect(content.reflectionQuestion.trim().endsWith('?')).toBe(true);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/generate`);
      req.flush('fail', { status: 500, statusText: 'Error' });
    });
  });
});
