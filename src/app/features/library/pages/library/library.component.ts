import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TrackService } from '@app/core/services';
import { Track, MusicCategory } from '@app/core/models/track.model';
import { Store } from '@ngrx/store';
import { loadTracks, addTrack, updateTrack, deleteTrack } from '@app/store/actions/track.actions';
import { TrackState } from '@app/store/reducers/track.reducer';
import * as TrackSelectors from '@app/store/selectors/track.selectors';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit {

  // 🔍 Recherche & filtre
  searchTerm = '';
  selectedCategory: MusicCategory | 'all' = 'all';

  // ➕ Formulaire ajout/edit track
  trackForm: FormGroup;
  fileError: string | null = null;
  isEditing = false;
  editingTrackId: string | null = null;

  // Observables pour la vue
  tracks$;
  error$;

  constructor(
    private trackService: TrackService,
    private fb: FormBuilder,
    private store: Store<{ track: TrackState }>
  ) {
    this.tracks$ = this.store.select(TrackSelectors.selectAllTracks);
    this.error$ = this.store.select(TrackSelectors.selectTrackError);

    this.trackForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(50)]],
      artist: ['', Validators.required],
      description: ['', Validators.maxLength(200)],
      category: ['pop', Validators.required],
      audioFile: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.store.dispatch(loadTracks());
  }

  // 🎧 Sélection fichier audio
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // 🔒 Taille max 50MB
    if (file.size > 50 * 1024 * 1024) {
      this.fileError = 'Le fichier dépasse 50MB';
      return;
    }

    // 🔒 Formats autorisés
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (!allowedTypes.includes(file.type)) {
      this.fileError = 'Format non supporté (MP3, WAV, OGG)';
      return;
    }

    this.fileError = null;
    this.trackForm.patchValue({ audioFile: file });
  }

  // 📝 Editer un track (remplit le formulaire)
  editTrack(track: Track): void {
    this.isEditing = true;
    this.editingTrackId = track.id;
    this.trackForm.patchValue({
      title: track.title,
      artist: track.artist,
      description: track.description,
      category: track.category,
      audioFile: null // Pas besoin de re-sélectionner le fichier pour un update
    });
    // Pour l'edit, le fichier n'est plus requis
    this.trackForm.get('audioFile')?.setValidators([]);
    this.trackForm.get('audioFile')?.updateValueAndValidity();
    
    // Aller au formulaire (simple scroll)
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editingTrackId = null;
    this.trackForm.reset({ category: 'pop' });
    this.trackForm.get('audioFile')?.setValidators([Validators.required]);
    this.trackForm.get('audioFile')?.updateValueAndValidity();
  }

  // ➕ Ajouter / Modifier un track
  async submit(): Promise<void> {
    if (this.trackForm.invalid || this.fileError) return;

    if (this.isEditing && this.editingTrackId) {
      // Logic for Update
      const trackUpdate: Track = {
        ...this.trackForm.value,
        id: this.editingTrackId,
        addedDate: new Date().toISOString(), // Fallback
        audioUrl: '' 
      };

      this.store.dispatch(updateTrack({ id: this.editingTrackId, track: trackUpdate }));
      this.cancelEdit();

    } else {
      // Logic for Create
      const file = this.trackForm.value.audioFile as File;
      const audio = new Audio(URL.createObjectURL(file));
      audio.onloadedmetadata = async () => {
        const trackData: Track = {
          id: '',
          title: this.trackForm.value.title!,
          artist: this.trackForm.value.artist!,
          description: this.trackForm.value.description || '',
          category: this.trackForm.value.category as MusicCategory,
          duration: Math.floor(audio.duration).toString(),
          addedDate: new Date().toISOString(),
          audioUrl: ''
        };

        this.store.dispatch(addTrack({ track: trackData, file }));
        this.trackForm.reset({ category: 'pop' });
      };
    }
  }

  // 🔍 Recherche + filtre
  filterTracks(tracks: Track[]): Track[] {
    return tracks.filter(track => {
      const matchesSearch =
        track.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        track.artist.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCategory =
        this.selectedCategory === 'all' ||
        track.category === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }

  // 🗑 Supprimer
  deleteTrack(id: string): void {
    if (confirm('Voulez-vous vraiment supprimer ce track ?')) {
      this.store.dispatch(deleteTrack({ id }));
    }
  }
}
