
export interface UserProfile {
  name: string;
  age: number;
  gender: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export enum Sentiment {
  Positive = 'positive',
  Negative = 'negative',
}

export interface JournalEntry {
  id: string;
  date: string; // ISO string
  content: string;
  sentiment: Sentiment;
}

export type Mood = 'Happy' | 'Okay' | 'Sad' | 'Anxious' | 'Calm';

export interface MoodEntry {
  date: string; // YYYY-MM-DD
  mood: Mood;
}

export interface Helpline {
  name: string;
  number: string;
  description: string;
}
