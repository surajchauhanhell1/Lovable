export interface AISuggestion {
  id: string;
  title: string;
  description: string;
  category: 'ui' | 'feature' | 'content' | 'performance' | 'accessibility';
  difficulty: 'easy' | 'medium' | 'hard';
  prompt: string;
  icon: string;
}

export interface ScrapedWebsite {
  url: string;
  content: any;
  timestamp: Date;
}

export interface GeneratedCode {
  files: Array<{ path: string; content: string }>;
  components: string[];
}
