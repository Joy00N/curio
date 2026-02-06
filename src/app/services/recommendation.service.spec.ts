import { TestBed } from '@angular/core/testing';
import { RecommendationService } from './recommendation.service';
import { StorageService } from './storage.service';

describe('RecommendationService', () => {
  let service: RecommendationService;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('StorageService', ['getLast14Topics']);

    TestBed.configureTestingModule({
      providers: [
        RecommendationService,
        { provide: StorageService, useValue: spy }
      ]
    });

    service = TestBed.inject(RecommendationService);
    storageServiceSpy = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCategories', () => {
    it('should return all available categories', () => {
      const categories = service.getCategories();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain('Technology');
      expect(categories).toContain('Science');
      expect(categories).toContain('Psychology');
    });

    it('should return at least 13 categories', () => {
      const categories = service.getCategories();
      expect(categories.length).toBeGreaterThanOrEqual(13);
    });
  });

  describe('getTopicsForCategory', () => {
    it('should return topics for a valid category', () => {
      const topics = service.getTopicsForCategory('Technology');
      expect(topics.length).toBeGreaterThan(0);
      expect(topics[0]).toHaveProperty('topic');
      expect(topics[0]).toHaveProperty('teaser');
    });

    it('should return at least 10 topics per category', () => {
      const categories = service.getCategories();
      categories.forEach(category => {
        const topics = service.getTopicsForCategory(category);
        expect(topics.length).toBeGreaterThanOrEqual(10);
      });
    });

    it('should return empty array for invalid category', () => {
      const topics = service.getTopicsForCategory('InvalidCategory');
      expect(topics.length).toBe(0);
    });

    it('should have teasers within 140 character limit', () => {
      const categories = service.getCategories();
      categories.forEach(category => {
        const topics = service.getTopicsForCategory(category);
        topics.forEach(topic => {
          expect(topic.teaser.length).toBeLessThanOrEqual(140);
        });
      });
    });
  });

  describe('chooseTopicForToday', () => {
    beforeEach(() => {
      storageServiceSpy.getLast14Topics.and.returnValue(Promise.resolve([]));
    });

    it('should return a topic with all required fields', async () => {
      const result = await service.chooseTopicForToday(['Technology', 'Science']);
      expect(result).toHaveProperty('topic');
      expect(result).toHaveProperty('teaser');
      expect(result).toHaveProperty('category');
      expect(result.topic).toBeTruthy();
      expect(result.teaser).toBeTruthy();
      expect(result.category).toBeTruthy();
    });

    it('should avoid recently used topics', async () => {
      const recentTopics = ['Quantum Computing', 'Neural Networks'];
      storageServiceSpy.getLast14Topics.and.returnValue(Promise.resolve(recentTopics));

      const result = await service.chooseTopicForToday(['Technology']);
      expect(recentTopics).not.toContain(result.topic);
    });

    it('should fallback to random category when no interests provided', async () => {
      const result = await service.chooseTopicForToday([]);
      expect(result).toHaveProperty('topic');
      expect(result).toHaveProperty('category');
    });

    it('should select from user interests', async () => {
      const userInterests = ['Technology', 'Science'];
      const results: string[] = [];

      // Run multiple times to test distribution
      for (let i = 0; i < 20; i++) {
        const result = await service.chooseTopicForToday(userInterests);
        results.push(result.category);
      }

      // At least some should be from user interests (allowing for wildcard)
      const fromUserInterests = results.filter(cat => userInterests.includes(cat));
      expect(fromUserInterests.length).toBeGreaterThan(10);
    });
  });

  describe('getAlternativeTopics', () => {
    beforeEach(() => {
      storageServiceSpy.getLast14Topics.and.returnValue(Promise.resolve([]));
    });

    it('should return requested number of alternatives', async () => {
      const alternatives = await service.getAlternativeTopics(
        'Quantum Computing',
        ['Technology'],
        2
      );
      expect(alternatives.length).toBe(2);
    });

    it('should not include the current topic', async () => {
      const currentTopic = 'Quantum Computing';
      const alternatives = await service.getAlternativeTopics(
        currentTopic,
        ['Technology'],
        2
      );
      
      alternatives.forEach(alt => {
        expect(alt.topic).not.toBe(currentTopic);
      });
    });

    it('should return unique alternatives', async () => {
      const alternatives = await service.getAlternativeTopics(
        'Quantum Computing',
        ['Technology'],
        2
      );
      
      const topics = alternatives.map(a => a.topic);
      const uniqueTopics = new Set(topics);
      expect(uniqueTopics.size).toBe(topics.length);
    });
  });
});
