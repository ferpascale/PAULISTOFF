
export type Category = 'Película' | 'Serie' | 'Recital';

export interface CulturalEntry {
  id: string;
  category: Category;
  title: string;
  date: string;
  rating: number; // 0-10
  notes: string;
  season?: string;
  episode?: string;
  createdAt: number;
}
