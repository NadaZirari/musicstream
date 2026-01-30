import { createAction, props } from '@ngrx/store';
import { Track } from '../../core/models/track.model';

export const loadTracks = createAction('[Track] Load Tracks');
export const loadTracksSuccess = createAction('[Track] Load Tracks Success', props<{ tracks: Track[] }>());
export const loadTracksFailure = createAction('[Track] Load Tracks Failure', props<{ error: any }>());
