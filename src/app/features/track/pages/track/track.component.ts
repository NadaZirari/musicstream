import { Component, inject, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Track } from '@app/core/models/track.model';
import { TrackService } from '@app/core/services';
import { LoadingState } from '@app/core/models/state.model';

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
  private trackService = inject(TrackService);
  private subscription: Subscription | null = null;
  
  trackId: string | null = null;
  track: Track | null = null;
  state: LoadingState = 'idle';
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
    // S'abonner aux changements de paramètres d'URL
    this.route.paramMap.subscribe(params => {
      this.trackId = params.get('id');
      console.log('Track ID changed to:', this.trackId);
      this.loadTrack();
    });
    
    // S'abonner aux changements de pistes pour mettre à jour la navigation
    this.trackService.tracks$.subscribe(tracks => {
      this.allTracks = tracks;
      this.currentTrackIndex = tracks.findIndex(t => t.id === this.trackId);
      console.log('Tracks updated, current index:', this.currentTrackIndex);
    });
  }

  private loadTrack() {
    if (!this.trackId) {
      this.state = 'error';
      this.error = 'Aucun identifiant de piste fourni';
      return;
    }

    this.state = 'loading';
    
    // Se désabonner de l'ancien abonnement s'il existe
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    
    // Arrêter l'audio actuel
    if (this.audioPlayer) {
      this.audioPlayer.nativeElement.pause();
      this.audioPlayer.nativeElement.currentTime = 0;
    }
    
    // Vérifier d'abord si les pistes sont déjà chargées
    const existingTrack = this.trackService.getTrackById(this.trackId);
    if (existingTrack) {
      this.track = existingTrack;
      this.updateNavigationData();
      this.state = 'success';
      // Forcer le rechargement de l'audio après un court délai
      setTimeout(() => {
        if (this.audioPlayer) {
          this.audioPlayer.nativeElement.load();
        }
      }, 100);
      return;
    }
    
    // Si la piste n'est pas trouvée, essayer de recharger les pistes
    this.subscription = this.trackService.tracks$.subscribe({
      next: (tracks) => {
        const foundTrack = tracks.find(t => t.id === this.trackId) || this.trackService.getTrackById(this.trackId!);
        if (foundTrack) {
          this.track = foundTrack;
          this.allTracks = tracks;
          this.currentTrackIndex = tracks.findIndex(t => t.id === this.trackId);
          this.state = 'success';
          // Forcer le rechargement de l'audio après un court délai
          setTimeout(() => {
            if (this.audioPlayer) {
              this.audioPlayer.nativeElement.load();
            }
          }, 100);
        } else if (this.state !== 'loading') {
          // Si on a déjà essayé de charger mais qu'on n'est pas en train de charger
          this.state = 'error';
          this.error = 'Piste non trouvée. Essayez de recharger la page.';
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des pistes:', err);
        this.state = 'error';
        this.error = 'Erreur lors du chargement de la piste: ' + (err.message || 'Erreur inconnue');
      }
    });
    
    // Vérifier l'état actuel et charger les pistes si nécessaire
    const stateSubscription = this.trackService.state$.subscribe({
      next: (state) => {
        if (state === 'success') {
          // Si l'état est déjà en succès, vérifier à nouveau la piste
          const foundTrack = this.trackService.getTrackById(this.trackId!);
          if (foundTrack) {
            this.track = foundTrack;
            this.updateNavigationData();
            this.state = 'success';
          } else {
            // Si on n'a toujours pas trouvé la piste, essayer de recharger
            this.trackService.loadTracks();
          }
        } else if (state === 'idle' || state === 'error') {
          // Si l'état est inactif ou en erreur, recharger
          this.trackService.loadTracks();
        }
      },
      error: (err) => {
        console.error('Erreur lors de la vérification de l\'état:', err);
        this.state = 'error';
        this.error = 'Erreur lors du chargement des données';
      }
    });
    
    // Ajouter à la liste des abonnements à nettoyer
    if (this.subscription) {
      this.subscription.add(stateSubscription);
    } else {
      this.subscription = stateSubscription;
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
  
  private updateNavigationData(): void {
    this.trackService.tracks$.subscribe(tracks => {
      this.allTracks = tracks;
      this.currentTrackIndex = tracks.findIndex(t => t.id === this.trackId);
      console.log('Navigation data updated:', { 
        tracksCount: tracks.length, 
        currentIndex: this.currentTrackIndex,
        trackId: this.trackId,
        hasPrevious: this.hasPreviousTrack,
        hasNext: this.hasNextTrack
      });
    });
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
    console.log('Previous track clicked:', { 
      currentIndex: this.currentTrackIndex, 
      hasPrevious: this.hasPreviousTrack,
      allTracksLength: this.allTracks.length 
    });
    if (this.hasPreviousTrack) {
      const previousTrack = this.allTracks[this.currentTrackIndex - 1];
      console.log('Navigating to previous track:', previousTrack.id);
      this.router.navigate(['/track', previousTrack.id]);
    }
  }
  
  goToNextTrack(): void {
    console.log('Next track clicked:', { 
      currentIndex: this.currentTrackIndex, 
      hasNext: this.hasNextTrack,
      allTracksLength: this.allTracks.length 
    });
    if (this.hasNextTrack) {
      const nextTrack = this.allTracks[this.currentTrackIndex + 1];
      console.log('Navigating to next track:', nextTrack.id);
      this.router.navigate(['/track', nextTrack.id]);
    }
  }
  
  ngOnDestroy() {
    // Nettoyer les abonnements lors de la destruction du composant
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
