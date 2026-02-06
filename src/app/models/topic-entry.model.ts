export interface TopicEntry {
  id: string;
  date: string; // ISO date string
  topic: string;
  teaser: string;
  eli7: string;
  deeper: string;
  example: string;
  whyItMatters: string;
  reflectionQuestion: string;
  source: 'dailyRecommendation' | 'userQuery';
  category?: string;
  isFavorite?: boolean;
}

export interface GeneratedContent {
  topic: string;
  teaser: string;
  eli7: string;
  deeper: string;
  example: string;
  whyItMatters: string;
  reflectionQuestion: string;
}
