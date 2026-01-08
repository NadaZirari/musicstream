import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { TrackService } from '../../../core/services/track.service';
import { Track, MusicCategory } from '../../../core/models/track.model';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit {

  // 🔍 Recherche & filtre
  searchTerm = '';
  selectedCategory: MusicCategory | 'all' = 'all';

  // ➕ Formulaire ajout track
  trackForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(50)]],
    artist: ['', Validators.required],
    description: ['', Validators.maxLength(200)],
    category: ['pop', Validators.required],
    audioFile: [null, Validators.required]
  });

  fileError: string | null = null;

  constructor(
    public trackService: TrackService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.trackService.loadTracks();
  }

  // 🎧 Sélection fichier audio
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // 🔒 Taille max 10MB
    if (file.size > 10 * 1024 * 1024) {
      this.fileError = 'Le fichier dépasse 10MB';
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

  // ➕ Ajouter un track
  async submit(): Promise<void> {
    if (this.trackForm.invalid || this.fileError) return;

    const file = this.trackForm.value.audioFile as File;

    const audio = new Audio(URL.createObjectURL(file));
    audio.onloadedmetadata = async () => {

      const track: Track = {
        id: crypto.randomUUID(),
        title: this.trackForm.value.title!,
        artist: this.trackForm.value.artist!,
        description: this.trackForm.value.description || '',
        category: this.trackForm.value.category!,
        duration: Math.floor(audio.duration),
        createdAt: new Date(),
        audioUrl: ''
      };

      await this.trackService.addTrack(track, file);
      this.trackForm.reset({ category: 'pop' });
    };
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
    this.trackService.deleteTrack(id);
  }
}
