import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { TopicEntry, UserPreferences, TodayTopic, DEFAULT_PREFERENCES } from '../models';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly KEYS = {
    PREFERENCES: 'user_preferences',
    TODAY_TOPIC: 'today_topic',
    ENTRIES: 'topic_entries',
    LAST_14_TOPICS: 'last_14_topics'
  };

  constructor() {}

  // User Preferences
  async getPreferences(): Promise<UserPreferences> {
    try {
      const { value } = await Preferences.get({ key: this.KEYS.PREFERENCES });
      return value ? JSON.parse(value) : { ...DEFAULT_PREFERENCES };
    } catch (error) {
      console.error('Error getting preferences:', error);
      return { ...DEFAULT_PREFERENCES };
    }
  }

  async setPreferences(preferences: UserPreferences): Promise<void> {
    try {
      await Preferences.set({
        key: this.KEYS.PREFERENCES,
        value: JSON.stringify(preferences)
      });
    } catch (error) {
      console.error('Error setting preferences:', error);
      throw error;
    }
  }

  // Today's Topic
  async getTodayTopic(dateKey: string): Promise<TodayTopic | null> {
    try {
      const { value } = await Preferences.get({ key: `${this.KEYS.TODAY_TOPIC}_${dateKey}` });
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting today topic:', error);
      return null;
    }
  }

  async setTodayTopic(dateKey: string, topic: TodayTopic): Promise<void> {
    try {
      await Preferences.set({
        key: `${this.KEYS.TODAY_TOPIC}_${dateKey}`,
        value: JSON.stringify(topic)
      });
    } catch (error) {
      console.error('Error setting today topic:', error);
      throw error;
    }
  }

  // Topic Entries (History)
  async getEntries(): Promise<TopicEntry[]> {
    try {
      const { value } = await Preferences.get({ key: this.KEYS.ENTRIES });
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting entries:', error);
      return [];
    }
  }

  async addEntry(entry: TopicEntry): Promise<void> {
    try {
      const entries = await this.getEntries();
      entries.unshift(entry); // Add to beginning (most recent first)
      await Preferences.set({
        key: this.KEYS.ENTRIES,
        value: JSON.stringify(entries)
      });
      
      // Update last 14 topics list
      await this.updateLast14Topics(entry.topic);
    } catch (error) {
      console.error('Error adding entry:', error);
      throw error;
    }
  }

  async getEntryById(id: string): Promise<TopicEntry | null> {
    try {
      const entries = await this.getEntries();
      return entries.find(e => e.id === id) || null;
    } catch (error) {
      console.error('Error getting entry by id:', error);
      return null;
    }
  }

  async updateEntry(id: string, updates: Partial<TopicEntry>): Promise<void> {
    try {
      const entries = await this.getEntries();
      const index = entries.findIndex(e => e.id === id);
      if (index !== -1) {
        entries[index] = { ...entries[index], ...updates };
        await Preferences.set({
          key: this.KEYS.ENTRIES,
          value: JSON.stringify(entries)
        });
      }
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  }

  // Last 14 topics (for recommendation deduplication)
  async getLast14Topics(): Promise<string[]> {
    try {
      const { value } = await Preferences.get({ key: this.KEYS.LAST_14_TOPICS });
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting last 14 topics:', error);
      return [];
    }
  }

  private async updateLast14Topics(topic: string): Promise<void> {
    try {
      let topics = await this.getLast14Topics();
      topics = [topic, ...topics.filter(t => t !== topic)].slice(0, 14);
      await Preferences.set({
        key: this.KEYS.LAST_14_TOPICS,
        value: JSON.stringify(topics)
      });
    } catch (error) {
      console.error('Error updating last 14 topics:', error);
    }
  }

  // Clear all data
  async clearAll(): Promise<void> {
    try {
      await Preferences.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  // Search entries
  async searchEntries(query: string): Promise<TopicEntry[]> {
    try {
      const entries = await this.getEntries();
      const lowerQuery = query.toLowerCase();
      return entries.filter(entry => 
        entry.topic.toLowerCase().includes(lowerQuery) ||
        entry.teaser.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('Error searching entries:', error);
      return [];
    }
  }
}
