export interface Movie {
  id: string;
  title: string;
  year: string;
  genre: string[];
  rating: string;
  description: string;
  director: string;
  runtime: string;
  releaseDate: string;
  posterUrl: string;
  tags: string[];
  isMustWatch?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  movies?: Movie[];
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}
