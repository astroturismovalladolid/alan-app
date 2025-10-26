export interface LightPollutionImage {
  id: string;
  url: string;
  dataAiHint: string;
  location: string;
  rating: number; // 1 to 5
  description: string;
  author: string;
  timestamp: string;
}

export interface ForumPost {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
}

export interface ForumTopic {
  id: string;
  title: string;
  postCount: number;
  lastActivity: string;
  posts: ForumPost[];
}
