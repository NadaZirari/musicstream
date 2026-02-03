import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Track } from '@core/models/track.model';

@Injectable({
  providedIn: 'root'
})
export class TrackService {

  private api = 'http://localhost:8080/api/tracks';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Track[]> {
    return this.http.get<Track[]>(this.api).pipe(
      map(tracks => tracks.map(t => ({
        ...t,
        audioUrl: `http://localhost:8080${t.audioUrl}`
      })))
    );
  }

  add(track: Track, file: File): Observable<Track> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', track.title);
    formData.append('artist', track.artist);
    formData.append('category', track.category);
    formData.append('description', track.description || '');
    formData.append('duration', track.duration.toString());

    return this.http.post<Track>(this.api, formData);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  update(id: string, track: Partial<Track>): Observable<Track> {
    const body = {
      title: track.title,
      artist: track.artist,
      category: track.category,
      description: track.description || '',
      duration: track.duration?.toString() || '0'
    };
    return this.http.put<Track>(`${this.api}/${id}`, body);
  }
}
