export interface TodayTopic {
  dateKey: string; // 'YYYY-MM-DD'
  topic: string;
  teaser: string;
  category: string;
  entryId?: string; // Links to TopicEntry when explanation is generated
}
