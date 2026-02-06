import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../../services/storage.service';
import { RecommendationService } from '../../services/recommendation.service';
import { ContentGenerationService } from '../../services/content-generation.service';
import { TodayTopic, TopicEntry } from '../../models';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  todayTopic: TodayTopic | null = null;
  alternativeTopics: Array<{ topic: string; teaser: string; category: string }> = [];
  showAlternatives = false;
  
  userQuery = '';
  isLoadingToday = false;
  isLoadingQuery = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private storage: StorageService,
    private recommendation: RecommendationService,
    private contentGeneration: ContentGenerationService
  ) {}

  async ngOnInit() {
    await this.loadTodayTopic();
  }

  async ionViewWillEnter() {
    // Refresh today's topic when returning to page
    await this.loadTodayTopic();
  }

  /**
   * Load or generate today's topic
   */
  private async loadTodayTopic() {
    this.isLoadingToday = true;
    this.errorMessage = '';

    try {
      const dateKey = this.getDateKey();
      let topic = await this.storage.getTodayTopic(dateKey);

      if (!topic) {
        // Generate new topic for today
        const preferences = await this.storage.getPreferences();
        const recommended = await this.recommendation.chooseTopicForToday(
          preferences.selectedInterests
        );

        topic = {
          dateKey,
          topic: recommended.topic,
          teaser: recommended.teaser,
          category: recommended.category
        };

        await this.storage.setTodayTopic(dateKey, topic);
      }

      this.todayTopic = topic;
    } catch (error) {
      console.error('Error loading today topic:', error);
      this.errorMessage = 'Failed to load today\'s topic. Please try again.';
    } finally {
      this.isLoadingToday = false;
    }
  }

  /**
   * Teach me today's topic
   */
  async teachMeToday() {
    if (!this.todayTopic) return;

    // If explanation already exists, navigate to it
    if (this.todayTopic.entryId) {
      await this.router.navigate(['/explain', this.todayTopic.entryId]);
      return;
    }

    // Generate explanation
    await this.generateAndNavigate(
      this.todayTopic.topic,
      'dailyRecommendation',
      this.todayTopic.category
    );
  }

  /**
   * Show alternative topics
   */
  async pickAnother() {
    if (!this.todayTopic) return;

    this.showAlternatives = true;
    
    try {
      const preferences = await this.storage.getPreferences();
      this.alternativeTopics = await this.recommendation.getAlternativeTopics(
        this.todayTopic.topic,
        preferences.selectedInterests,
        2
      );
    } catch (error) {
      console.error('Error getting alternatives:', error);
    }
  }

  /**
   * Select alternative topic
   */
  async selectAlternative(alternative: { topic: string; teaser: string; category: string }) {
    const dateKey = this.getDateKey();
    
    // Update today's topic
    this.todayTopic = {
      dateKey,
      topic: alternative.topic,
      teaser: alternative.teaser,
      category: alternative.category
    };

    await this.storage.setTodayTopic(dateKey, this.todayTopic);
    this.showAlternatives = false;
    this.alternativeTopics = [];
  }

  /**
   * Cancel alternative selection
   */
  cancelAlternatives() {
    this.showAlternatives = false;
    this.alternativeTopics = [];
  }

  /**
   * Teach me user query
   */
  async teachMeQuery() {
    const query = this.userQuery.trim();
    if (!query) return;

    await this.generateAndNavigate(query, 'userQuery');
  }

  /**
   * Generate explanation and navigate to it
   */
  private async generateAndNavigate(
    topic: string,
    source: 'dailyRecommendation' | 'userQuery',
    category?: string
  ) {
    this.isLoadingQuery = source === 'userQuery';
    this.isLoadingToday = source === 'dailyRecommendation';
    this.errorMessage = '';

    try {
      const preferences = await this.storage.getPreferences();

      // Generate content
      const content = await this.contentGeneration.generate({
        topic,
        depth: preferences.depth,
        userInterests: preferences.selectedInterests,
        context: {
          date: new Date().toISOString(),
          locale: 'en-US'
        }
      }).toPromise();

      if (!content) {
        throw new Error('No content generated');
      }

      // Create entry
      const entry: TopicEntry = {
        id: uuidv4(),
        date: new Date().toISOString(),
        topic: content.topic,
        teaser: content.teaser,
        eli7: content.eli7,
        deeper: content.deeper,
        example: content.example,
        whyItMatters: content.whyItMatters,
        reflectionQuestion: content.reflectionQuestion,
        source,
        category,
        isFavorite: false
      };

      await this.storage.addEntry(entry);

      // Update today's topic with entry ID if it's the daily recommendation
      if (source === 'dailyRecommendation' && this.todayTopic) {
        this.todayTopic.entryId = entry.id;
        await this.storage.setTodayTopic(this.getDateKey(), this.todayTopic);
      }

      // Clear user query
      if (source === 'userQuery') {
        this.userQuery = '';
      }

      // Navigate to explanation
      await this.router.navigate(['/explain', entry.id]);
    } catch (error) {
      console.error('Error generating content:', error);
      this.errorMessage = 'Failed to generate explanation. Please try again.';
    } finally {
      this.isLoadingQuery = false;
      this.isLoadingToday = false;
    }
  }

  /**
   * Retry loading today's topic
   */
  async retryToday() {
    await this.loadTodayTopic();
  }

  /**
   * Get current date key (YYYY-MM-DD)
   */
  private getDateKey(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }
}
