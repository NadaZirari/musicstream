import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrackService } from '../../core/services/track.service';
import { Track, MusicCategory } from '../../core/models/track.model';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit {

  searchTerm = '';
  selectedCategory: MusicCategory | 'all' = 'all';

  constructor(public trackService: TrackService) {}

  ngOnInit(): void {
    this.trackService.loadTracks();
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

  deleteTrack(id: string): void {
    this.trackService.deleteTrack(id);
  }
}
