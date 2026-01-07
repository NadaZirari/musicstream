import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Track } from '../models/track.model';
import { PlayerState } from '../models/player-state.model';

@Injectable({
  providedIn: 'root'
})
export class AudioPlayerService {

  private audio = new Audio();
  private playlist: Track[] = [];
  private currentIndex = -1;

  private currentTrackSubject = new BehaviorSubject<Track | null>(null);
  private playerStateSubject = new BehaviorSubject<PlayerState>('stopped');
  private currentTimeSubject = new BehaviorSubject<number>(0);
  private durationSubject = new BehaviorSubject<number>(0);
  private volumeSubject = new BehaviorSubject<number>(1);


  currentTrack$ = this.currentTrackSubject.asObservable();
  state$ = this.playerStateSubject.asObservable();
  currentTime$ = this.currentTimeSubject.asObservable();
  duration$ = this.durationSubject.asObservable();
  volume$ = this.volumeSubject.asObservable();

  constructor() {
    this.initAudioEvents();
  }


  private initAudioEvents(): void {
    this.audio.addEventListener('timeupdate', () => {
      this.currentTimeSubject.next(this.audio.currentTime);
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.durationSubject.next(this.audio.duration);
    });

    this.audio.addEventListener('playing', () => {
      this.playerStateSubject.next('playing');
    });

    this.audio.addEventListener('pause', () => {
      this.playerStateSubject.next('paused');
    });

    this.audio.addEventListener('waiting', () => {
      this.playerStateSubject.next('buffering');
    });

    this.audio.addEventListener('ended', () => {
      this.next();
    });
  }


  setPlaylist(tracks: Track[], startIndex: number = 0): void {
    this.playlist = tracks;
    this.currentIndex = startIndex;
    this.loadCurrentTrack();
  }


  private loadCurrentTrack(): void {
    const track = this.playlist[this.currentIndex];
    if (!track) return;

    this.audio.src = track.audioUrl;
    this.audio.load();
    this.currentTrackSubject.next(track);
  }


  play(): void {
    if (!this.audio.src) return;
    this.audio.play();
  }

  pause(): void {
    this.audio.pause();
  }


  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.playerStateSubject.next('stopped');
  }


  next(): void {
    if (this.currentIndex < this.playlist.length - 1) {
      this.currentIndex++;
      this.loadCurrentTrack();
      this.play();
    } else {
      this.stop();
    }
  }


  previous(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.loadCurrentTrack();
      this.play();
    }
  }


  setVolume(volume: number): void {
    this.audio.volume = volume;
    this.volumeSubject.next(volume);
  }


  seek(time: number): void {
    this.audio.currentTime = time;
  }
}
