import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {NavigationStackEntry} from '#/features/details/types';
import {LOADING_DISPLAY} from '#/utils/constants';

import {readNavigationPath} from './navigation.util';

export interface NavigationState {
  path: string;
  pathArray: string[];
  previousPath?: string;
  externalAction: string;
  currentDetailIndex: number;
  currentScreenIndex: number;
  inDetour: boolean;
  navigationStack: NavigationStackEntry[];
}

const initialState: NavigationState = {
  path: LOADING_DISPLAY,
  pathArray: [LOADING_DISPLAY],
  previousPath: undefined,
  externalAction: '',
  currentDetailIndex: -1,
  currentScreenIndex: 0,
  inDetour: false,
  navigationStack: [],
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setNavigationPath: (
      state,
      action: PayloadAction<{navigationPath: string; navigationPathArray: string[]}>
    ) => {
      state.previousPath = state.path;
      state.path = action.payload.navigationPath;
      state.pathArray = action.payload.navigationPathArray;
    },
    setExternalAction: (state, action: PayloadAction<string>) => {
      state.externalAction = action.payload;
    },
    setCurrentDetailIndex: (state, action: PayloadAction<number>) => {
      state.currentDetailIndex = action.payload;
    },
    setCurrentScreenIndex: (state, action: PayloadAction<number>) => {
      state.currentScreenIndex = action.payload;
    },
    setInDetour: (state, action: PayloadAction<boolean>) => {
      state.inDetour = action.payload;
    },
    pushToNavigationStack: (state, action: PayloadAction<NavigationStackEntry>) => {
      state.navigationStack.push(action.payload);
    },
    popFromNavigationStack: state => {
      state.navigationStack = state.navigationStack.slice(0, -1);
    },
    removeStackEntriesByDetailIndex: (state, action: PayloadAction<number>) => {
      state.navigationStack = state.navigationStack.filter(
        entry => entry.detailIndex !== action.payload
      );
    },
    clearNavigationStack: state => {
      state.navigationStack = [];
    },
  },
});

export const actions = navigationSlice.actions;

export const setNavigationPath = (path: string) => {
  const navigationArray = readNavigationPath(path);
  return actions.setNavigationPath({
    navigationPath: path,
    navigationPathArray: navigationArray,
  });
};

export const setExternalAction = (externalAction: string) => {
  return actions.setExternalAction(externalAction);
};

export const setCurrentDetailIndex = (index: number) => {
  return actions.setCurrentDetailIndex(index);
};

export const setCurrentScreenIndex = (index: number) => {
  return actions.setCurrentScreenIndex(index);
};

export const setInDetour = (inDetour: boolean) => {
  return actions.setInDetour(inDetour);
};

export const pushToNavigationStack = (entry: NavigationStackEntry) => {
  return actions.pushToNavigationStack(entry);
};

export const popFromNavigationStack = () => {
  return actions.popFromNavigationStack();
};

export const removeStackEntriesByDetailIndex = (detailIndex: number) => {
  return actions.removeStackEntriesByDetailIndex(detailIndex);
};

export const clearNavigationStack = () => {
  return actions.clearNavigationStack();
};

export {navigateGenericRequest, navigateBackGenericRequest, startDetour} from './navigation.thunks';

export const navigation = navigationSlice.reducer;
