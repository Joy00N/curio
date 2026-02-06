import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ContentGenerationService } from './content-generation.service';
import { GeneratedContent } from '../models';

describe('ContentGenerationService', () => {
  let service: ContentGenerationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ContentGenerationService]
    });

    service = TestBed.inject(ContentGenerationService);
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

  describe('generate (mock mode)', () => {
    it('should generate content with all required fields', (done) => {
      const request = {
        topic: 'Test Topic',
        depth: 'normal' as const,
        userInterests: ['Technology'],
        context: {
          date: '2026-01-26',
          locale: 'en-US'
        }
      };

      service.generate(request).subscribe({
        next: (content) => {
          expect(content).toHaveProperty('topic');
          expect(content).toHaveProperty('teaser');
          expect(content).toHaveProperty('eli7');
          expect(content).toHaveProperty('deeper');
          expect(content).toHaveProperty('example');
          expect(content).toHaveProperty('whyItMatters');
          expect(content).toHaveProperty('reflectionQuestion');
          done();
        },
        error: done.fail
      });
    });

    it('should generate deterministic content for same topic', (done) => {
      const request = {
        topic: 'Quantum Computing',
        depth: 'normal' as const,
        userInterests: ['Technology'],
        context: {
          date: '2026-01-26',
          locale: 'en-US'
        }
      };

      let firstContent: GeneratedContent;

      service.generate(request).subscribe({
        next: (content) => {
          firstContent = content;
          
          // Generate again
          service.generate(request).subscribe({
            next: (secondContent) => {
              expect(secondContent.topic).toBe(firstContent.topic);
              expect(secondContent.teaser).toBe(firstContent.teaser);
              expect(secondContent.reflectionQuestion).toBe(firstContent.reflectionQuestion);
              done();
            },
            error: done.fail
          });
        },
        error: done.fail
      });
    });

    it('should generate valid teaser length', (done) => {
      const request = {
        topic: 'Test Topic',
        depth: 'normal' as const,
        userInterests: ['Technology'],
        context: {
          date: '2026-01-26',
          locale: 'en-US'
        }
      };

      service.generate(request).subscribe({
        next: (content) => {
          expect(content.teaser.length).toBeLessThanOrEqual(140);
          done();
        },
        error: done.fail
      });
    });

    it('should generate reflection question ending with question mark', (done) => {
      const request = {
        topic: 'Test Topic',
        depth: 'normal' as const,
        userInterests: ['Technology'],
        context: {
          date: '2026-01-26',
          locale: 'en-US'
        }
      };

      service.generate(request).subscribe({
        next: (content) => {
          expect(content.reflectionQuestion.trim().endsWith('?')).toBe(true);
          done();
        },
        error: done.fail
      });
    });

    it('should respect depth parameter', (done) => {
      const lightRequest = {
        topic: 'Test Topic',
        depth: 'light' as const,
        userInterests: ['Technology'],
        context: {
          date: '2026-01-26',
          locale: 'en-US'
        }
      };

      const normalRequest = { ...lightRequest, depth: 'normal' as const };

      service.generate(lightRequest).subscribe({
        next: (lightContent) => {
          service.generate(normalRequest).subscribe({
            next: (normalContent) => {
              // Normal should generally have more content than light
              expect(normalContent.deeper.length).toBeGreaterThanOrEqual(lightContent.deeper.length);
              done();
            },
            error: done.fail
          });
        },
        error: done.fail
      });
    });
  });
});
