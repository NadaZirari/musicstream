import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Track } from '../models/track.model';
import { LoadingState } from '../models/state.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TrackService {

  // 🔹 État global
  private tracksSubject = new BehaviorSubject<Track[]>([]);
  private stateSubject = new BehaviorSubject<LoadingState>('idle');
  private errorSubject = new BehaviorSubject<string | null>(null);

  // 🔹 Observables exposés
  tracks$ = this.tracksSubject.asObservable();
  state$ = this.stateSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  constructor(private storageService: StorageService) {}

  // 🔹 Charger tous les tracks
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
      this.errorSubject
