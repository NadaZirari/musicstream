import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TrackState } from '../reducers/track.reducer';

export const selectTrackState = createFeatureSelector<TrackState>('track');

export const selectAllTracks = createSelector(
  selectTrackState,
  (state: TrackState) => state.tracks
);

export const selectTrackError = createSelector(
  selectTrackState,
  (state: TrackState) => state.error
);

export const selectTrackById = (id: string) => createSelector(
  selectAllTracks,
  (tracks) => tracks.find(track => track.id === id)
);
