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
          catchError(error => of(TrackActions.loadTracksFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private trackService: TrackService) {}
}
