import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Track } from '@core/models/track.model';

@Injectable({
  providedIn: 'root'
})
export class TrackService {

  private api = 'http://localhost:8080/api/tracks';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Track[]> {
    return this.http.get<Track[]>(this.api);
  }

  add(track: Track): Observable<Track> {
    return this.http.post<Track>(this.api, track);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  update(id: string, track: Track): Observable<Track> {
    return this.http.put<Track>(`${this.api}/${id}`, track);
  }
}
