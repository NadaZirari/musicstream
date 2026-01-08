import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Track } from '../models/track.model';
import { LoadingState } from '../models/state.model';
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
  async loadTracks(): Promise<void> {
    this.stateSubject.next('loading');
    this.errorSubject.next(null);

    try {
      const data = await this.storageService.getAllTracks();

      const tracks: Track[] = data.map(item => ({
        id: item.id,
        title: item.title,
        artist: item.artist,
        description: item.description,
        category: item.category,
        duration: item.duration,
        createdAt: new Date(item.createdAt),
        audioUrl: URL.createObjectURL(item.audioFile)
      }));

      this.tracksSubject.next(tracks);
      this.stateSubject.next('success');

    } catch (error: any) {
      this.stateSubject.next('error');
      this.errorSubject.next(error?.toString() || 'Erreur chargement des tracks');
    }
  }

  // ==========================
  // ➕ ADD TRACK
  // ==========================
  async addTrack(track: Track, audioFile: Blob): Promise<void> {
    this.stateSubject.next('loading');

    try {
      await this.storageService.saveTrack(track, audioFile);
      await this.loadTracks();
    } catch (error: any) {
      this.stateSubject.next('error');
      this.errorSubject.next(error?.toString() || 'Erreur ajout du track');
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

  // ==========================
  // 🔍 GET TRACK BY ID
  // ==========================
  getTrackById(id: string): Track | undefined {
    return this.tracksSubject.getValue().find(track => track.id === id);
  }
}
