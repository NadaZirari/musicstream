import { createReducer, on } from '@ngrx/store';
import * as TrackActions from '../actions/track.actions';
import { Track } from '../../core/models/track.model';

export interface TrackState {
  tracks: Track[];
  error: any;
}

export const initialState: TrackState = {
  tracks: [],
  error: null
};

export const trackReducer = createReducer(
  initialState,
  on(TrackActions.loadTracksSuccess, (state, { tracks }) => ({ ...state, tracks, error: null })),
  on(
    TrackActions.loadTracksFailure,
    TrackActions.addTrackFailure,
    TrackActions.updateTrackFailure,
    TrackActions.deleteTrackFailure,
    (state, { error }) => ({ ...state, error })
  )
);
