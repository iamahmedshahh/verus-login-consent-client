import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {AnyAction, ThunkAction} from '@reduxjs/toolkit';

import type {AppDispatch, RootState} from './store';

// Allows for thunks to be dispatched with the correct types
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export type AppThunk = ThunkAction<Promise<void>, RootState, undefined, AnyAction>;
export type AppThunkSync = ThunkAction<void, RootState, undefined, AnyAction>;
