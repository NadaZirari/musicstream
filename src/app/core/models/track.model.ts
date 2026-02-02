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
  duration: string;           // en secondes
  addedDate: string;          // ISO string
  audioUrl: string;           // URL base/api/tracks/{id}/stream
}
