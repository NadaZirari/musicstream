export type MusicCategory =
  | 'pop'
  | 'rock'
  | 'rap'
  | 'jazz'
  | 'classical'
  | 'other';

export interface Track {
  id: string;
  title: string;
  artist: string;
  description?: string;
  category: MusicCategory;
  duration: number;           // en secondes (calculée auto)
  createdAt: Date;
  audioUrl: string;           // URL locale
}
