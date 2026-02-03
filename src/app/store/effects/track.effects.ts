import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TrackService } from '../../core/services/track.service';
import * as TrackActions from '../actions/track.actions';
import { mergeMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class TrackEffects {
  loadTracks$ = createEffect(() => 
    this.actions$.pipe(
      ofType(TrackActions.loadTracks),
      mergeMap(() => this.trackService.getAll()
        .pipe(
          map(tracks => TrackActions.loadTracksSuccess({ tracks })),
          catchError(error => of(TrackActions.loadTracksFailure({ error: error.message })))
        )
      )
    )
  );

  addTrack$ = createEffect(() => 
    this.actions$.pipe(
      ofType(TrackActions.addTrack),
      mergeMap(({ track, file }) => this.trackService.add(track, file)
        .pipe(
          map(newTrack => TrackActions.addTrackSuccess({ track: newTrack })),
          catchError(error => of(TrackActions.addTrackFailure({ error: error.message })))
        )
      )
    )
  );

  updateTrack$ = createEffect(() => 
    this.actions$.pipe(
      ofType(TrackActions.updateTrack),
      mergeMap(({ id, track }) => this.trackService.update(id, track)
        .pipe(
          map(updatedTrack => TrackActions.updateTrackSuccess({ track: updatedTrack })),
          catchError(error => of(TrackActions.updateTrackFailure({ error: error.message })))
        )
      )
    )
  );

  deleteTrack$ = createEffect(() => 
    this.actions$.pipe(
      ofType(TrackActions.deleteTrack),
      mergeMap(({ id }) => this.trackService.delete(id)
        .pipe(
          map(() => TrackActions.deleteTrackSuccess({ id })),
          catchError(error => of(TrackActions.deleteTrackFailure({ error: error.message })))
        )
      )
    )
  );

  // Trigger reload after success
  refreshAfterSuccess$ = createEffect(() => 
    this.actions$.pipe(
      ofType(
        TrackActions.addTrackSuccess,
        TrackActions.updateTrackSuccess,
        TrackActions.deleteTrackSuccess
      ),
      map(() => TrackActions.loadTracks())
    )
  );

  constructor(private actions$: Actions, private trackService: TrackService) {}
}
