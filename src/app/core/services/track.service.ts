import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Track } from '@core/models/track.model';
import { LoadingState } from '@core/models/state.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TrackService {

  // 🔹 State management
  private tracksSubject = new BehaviorSubject<Track[]>([]);
  private stateSubject = new BehaviorSubject<LoadingState>('idle');
  private errorSubject = new BehaviorSubject<string | null>(null);

  // 🔹 Observables publics
  tracks$ = this.tracksSubject.asObservable();
  state$ = this.stateSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  constructor(private storageService: StorageService) {}

  // ==========================
  // 📥 LOAD TRACKS
  // ==========================
  private _tracks: Track[] = [];
  
  async loadTracks(): Promise<void> {
    this.stateSubject.next('loading');
    this.errorSubject.next(null);

    try {
      const data = await this.storageService.getAllTracks();
      
      // Convertir les données brutes en objets Track
      this._tracks = data.map(item => {
        // Créer une URL d'objet pour le fichier audio
        const audioUrl = URL.createObjectURL(item.audioFile);
        
        return {
          id: item.id,
          title: item.title,
          artist: item.artist,
          description: item.description || '',
          category: item.category,
          duration: item.duration || 0,
          createdAt: item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt),
          audioUrl: audioUrl
        } as Track;
      });

      // Mettre à jour les observables
      this.tracksSubject.next([...this._tracks]);
      this.stateSubject.next('success');

    } catch (error: any) {
      console.error('Erreur lors du chargement des pistes:', error);
      this.stateSubject.next('error');
      this.errorSubject.next(error?.message || 'Erreur lors du chargement des pistes');
      this.tracksSubject.next([]);
    }
  }
  
  // ==========================
  // 🔍 GET TRACK BY ID
  // ==========================
  getTrackById(id: string): Track | undefined {
    return this._tracks.find(track => track.id === id);
  }

  // ==========================
  // ➕ ADD TRACK
  // ==========================
  async addTrack(track: Omit<Track, 'id' | 'createdAt' | 'audioUrl'>, audioFile: File): Promise<void> {
    this.stateSubject.next('loading');

    try {
      await this.storageService.saveTrack(track, audioFile);
      await this.loadTracks();
      this.stateSubject.next('success');
    } catch (error: any) {
      this.stateSubject.next('error');
      this.errorSubject.next(error?.toString() || 'Erreur ajout du track');
      throw error; // Re-throw to allow component to handle the error
    }
  }

  // ==========================
  // ❌ DELETE TRACK
  // ==========================
  async deleteTrack(id: string): Promise<void> {
    this.stateSubject.next('loading');

    try {
      await this.storageService.deleteTrack(id);
      await this.loadTracks();
    } catch (error: any) {
      this.stateSubject.next('error');
      this.errorSubject.next(error?.toString() || 'Erreur suppression du track');
    }
  }

  // ==========================
  // ✏️ UPDATE TRACK
  // ==========================
  async updateTrack(track: Track): Promise<void> {
    this.stateSubject.next('loading');

    try {
      await this.storageService.updateTrack(track);
      await this.loadTracks();
    } catch (error: any) {
      this.stateSubject.next('error');
      this.errorSubject.next(error?.toString() || 'Erreur mise à jour du track');
    }
  }

}
