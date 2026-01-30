import { Component, inject, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Track } from '@app/core/models/track.model';
import { loadTracks } from '@app/store/actions/track.actions';
import { TrackState } from '@app/store/reducers/track.reducer';

@Component({
  selector: 'app-track',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="track">
      <ng-container *ngIf="state === 'loading'">
        <p>Chargement des détails de la piste...</p>
      </ng-container>

      <ng-container *ngIf="state === 'error'">
        <p class="error">Erreur lors du chargement de la piste : {{ error }}</p>
      </ng-container>

      <ng-container *ngIf="state === 'success' && track">
        <div class="track-header">
          <h2>{{ track.title }}</h2>
          <p class="artist">Artiste : {{ track.artist }}</p>
        </div>

        <div class="track-details">
          <p><strong>Description :</strong> {{ track.description || 'Aucune description disponible' }}</p>
          <p><strong>Catégorie :</strong> {{ getCategoryName(track.category) }}</p>
          <p><strong>Durée :</strong> {{ formatDuration(track.duration) }}</p>
          <p><strong>Ajoutée le :</strong> {{ track.createdAt | date:'medium' }}</p>
        </div>

        <div class="audio-player">
          <h3>Écouter la piste :</h3>
          <ng-container *ngIf="track && trackId">
            <audio #audioPlayer controls>
              <source [src]="track.audioUrl" type="audio/mpeg">
              Votre navigateur ne supporte pas la lecture audio.
            </audio>
          </ng-container>
          
          <div class="navigation-buttons" *ngIf="hasNavigation">
            <button 
              class="nav-btn prev-btn" 
              [disabled]="!hasPreviousTrack" 
              (click)="goToPreviousTrack()"
              title="Piste précédente">
              ← Précédent
            </button>
            
            <button 
              class="nav-btn next-btn" 
              [disabled]="!hasNextTrack" 
              (click)="goToNextTrack()"
              title="Piste suivante">
              Suivant →
            </button>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .track {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .track-header {
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }
    
    h2 {
      color: #2c3e50;
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
    }
    
    .artist {
      color: #7f8c8d;
      font-size: 1.2rem;
      margin: 0;
    }
    
    .track-details {
      margin-bottom: 2rem;
    }
    
    .track-details p {
      margin: 0.5rem 0;
      color: #34495e;
      line-height: 1.6;
    }
    
    .audio-player {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #eee;
    }
    
    audio {
      width: 100%;
      margin-top: 1rem;
    }
    
    .error {
      color: #e74c3c;
      padding: 1rem;
      background-color: #fdecea;
      border-radius: 4px;
      border-left: 4px solid #e74c3c;
    }
    
    .navigation-buttons {
      display: flex;
      justify-content: space-between;
      margin-top: 1.5rem;
      gap: 1rem;
    }
    
    .nav-btn {
      flex: 1;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #3498db;
      color: white;
    }
    
    .nav-btn:hover:not(:disabled) {
      background: #2980b9;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    .nav-btn:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    
    .prev-btn {
      background: #27ae60;
    }
    
    .prev-btn:hover:not(:disabled) {
      background: #229954;
    }
    
    .next-btn {
      background: #e74c3c;
    }
    
    .next-btn:hover:not(:disabled) {
      background: #c0392b;
    }
  `]
})
export class TrackComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store<{ track: TrackState }>);
  private subscription: Subscription = new Subscription();
  
  trackId: string | null = null;
  track: Track | null = null;
  state: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  error: string | null = null;
  allTracks: Track[] = [];
  currentTrackIndex: number = -1;
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  
  categories = {
    pop: 'Pop',
    rock: 'Rock',
    rap: 'Rap',
    jazz: 'Jazz',
    classical: 'Classique',
    other: 'Autre'
  };

  ngOnInit() {
    this.state = 'loading'; // Assume loading initially
    this.store.dispatch(loadTracks());

    // Subscribe to tracks from store
    this.subscription.add(
      this.store.select(state => state.track).subscribe(trackState => {
        this.allTracks = trackState.tracks;
        if (trackState.error) {
          this.state = 'error';
          this.error = trackState.error;
        } else if (this.allTracks.length > 0) {
          this.state = 'success';
          this.updateCurrentTrack();
        }
      })
    );

    // Subscribe to route params
    this.subscription.add(
      this.route.paramMap.subscribe(params => {
        this.trackId = params.get('id');
        this.updateCurrentTrack();
      })
    );
  }

  private updateCurrentTrack() {
    if (this.trackId && this.allTracks.length > 0) {
      const track = this.allTracks.find(t => t.id === this.trackId);

      if (track) {
        this.track = track;
        this.currentTrackIndex = this.allTracks.indexOf(track);
        // Audio reload logic
        setTimeout(() => {
            if (this.audioPlayer) {
              this.audioPlayer.nativeElement.load();
            }
        }, 100);
      } else {
        // Track not found in list yet
      }
    }
  }

  getCategoryName(category: string): string {
    return this.categories[category as keyof typeof this.categories] || category;
  }

  formatDuration(seconds: number): string {
    if (!seconds) return 'Inconnue';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  get hasNavigation(): boolean {
    return this.allTracks.length > 1;
  }
  
  get hasPreviousTrack(): boolean {
    return this.currentTrackIndex > 0;
  }
  
  get hasNextTrack(): boolean {
    return this.currentTrackIndex >= 0 && this.currentTrackIndex < this.allTracks.length - 1;
  }
  
  goToPreviousTrack(): void {
    if (this.hasPreviousTrack) {
      const previousTrack = this.allTracks[this.currentTrackIndex - 1];
      this.router.navigate(['/track', previousTrack.id]);
    }
  }
  
  goToNextTrack(): void {
    if (this.hasNextTrack) {
      const nextTrack = this.allTracks[this.currentTrackIndex + 1];
      this.router.navigate(['/track', nextTrack.id]);
    }
  }
  
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
