import { Injectable } from '@angular/core';
import { GeneratedContent } from '../models';
import { BUNDLED_CONTENT } from '../data/bundled-content';

/**
 * Service that provides pre-generated content for seed topics.
 * Content is bundled with the app for offline-first experience.
 */
@Injectable({
  providedIn: 'root'
})
export class BundledContentService {

  /**
   * Look up pre-generated content for a topic.
   * Returns null if the topic is not in the bundled content.
   */
  getContent(topic: string): GeneratedContent | null {
    // Try exact match first
    if (BUNDLED_CONTENT[topic]) {
      return BUNDLED_CONTENT[topic];
    }

    // Try case-insensitive match
    const normalizedTopic = topic.toLowerCase().trim();
    const matchKey = Object.keys(BUNDLED_CONTENT).find(
      key => key.toLowerCase().trim() === normalizedTopic
    );

    return matchKey ? BUNDLED_CONTENT[matchKey] : null;
  }

  /**
   * Check if bundled content exists for a given topic.
   */
  hasContent(topic: string): boolean {
    return this.getContent(topic) !== null;
  }

  /**
   * Get the number of bundled topics available.
   */
  getBundledTopicCount(): number {
    return Object.keys(BUNDLED_CONTENT).length;
  }
}
