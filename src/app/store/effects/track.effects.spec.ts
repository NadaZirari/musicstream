import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { TrackEffects } from './track.effects';
import { TrackService } from '../../core/services/track.service';
import * as TrackActions from '../actions/track.actions';
import { Action } from '@ngrx/store';

describe('TrackEffects', () => {
  let actions$: Observable<Action>;
  let effects: TrackEffects;
  let trackService: jasmine.SpyObj<TrackService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('TrackService', ['getAll', 'add', 'update', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        TrackEffects,
        provideMockActions(() => actions$),
        { provide: TrackService, useValue: spy }
      ]
    });

    effects = TestBed.inject(TrackEffects);
    trackService = TestBed.inject(TrackService) as jasmine.SpyObj<TrackService>;
  });

  it('should load tracks successfully', (done) => {
    const tracks = [{ id: '1', title: 'Test' }] as any;
    trackService.getAll.and.returnValue(of(tracks));
    actions$ = of(TrackActions.loadTracks());

    effects.loadTracks$.subscribe(action => {
      expect(action).toEqual(TrackActions.loadTracksSuccess({ tracks }));
      done();
    });
  });

  it('should handle load tracks failure', (done) => {
    const error = 'Error loading tracks';
    trackService.getAll.and.returnValue(throwError(() => ({ message: error })));
    actions$ = of(TrackActions.loadTracks());

    effects.loadTracks$.subscribe(action => {
      expect(action).toEqual(TrackActions.loadTracksFailure({ error }));
      done();
    });
  });
});
