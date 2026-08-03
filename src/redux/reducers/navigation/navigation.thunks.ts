import {GenericRequest} from 'verus-typescript-primitives';

import {getDetailByIndex, getDetailMapEntry} from '#/features/details';
import {AppThunk, AppThunkSync} from '#/redux/hooks';
import {setError} from '#/redux/reducers/error/error.actions';
import {finalizeGenericRequest} from '#/redux/reducers/genericResponse/genericResponse.thunks';
import {AppDispatch, RootState} from '#/redux/store';

import {
  assertGenericRequest,
  generateAndStoreResponse,
  navigateToPath,
  pushCurrentScreenToStack,
} from './navigation.helpers';
import * as navActions from './navigationSlice';

async function processNextDetail(
  genericRequest: GenericRequest,
  startIndex: number,
  chainId: string,
  dispatch: AppDispatch,
  getState: () => RootState
): Promise<void> {
  let detailIndex = startIndex;

  while (true) {
    let detail = getDetailByIndex(genericRequest, detailIndex);

    // Fast-forward through detours.
    while (detail && getDetailMapEntry(detail).type === 'detour') {
      detailIndex++;
      detail = getDetailByIndex(genericRequest, detailIndex);
    }

    // The detours may be at the end, so check if we are done.
    if (!detail) {
      await dispatch(finalizeGenericRequest(genericRequest, chainId));
      return;
    }

    const mapEntry = getDetailMapEntry(detail);

    await mapEntry.prepFunction(detail, detailIndex, dispatch, getState);

    if (mapEntry.type === 'headless') {
      await generateAndStoreResponse(genericRequest, detailIndex, dispatch, getState);
      detailIndex++;
      continue;
    }

    if (mapEntry.type === 'standard') {
      if (mapEntry.screens.length === 0) {
        throw new Error(`Standard detail at index ${detailIndex} must have at least one screen.`);
      }
    }

    // Standard details have UI, so navigate to the first screen and stop
    const currentState = getState();
    pushCurrentScreenToStack(dispatch, currentState);

    dispatch(navActions.setCurrentDetailIndex(detailIndex));
    dispatch(navActions.setCurrentScreenIndex(0));
    navigateToPath(dispatch, mapEntry.screens[0]);
    return;
  }
}

/**
 * Thunk for navigating through each detail in the generic request
 */
export function navigateGenericRequest(): AppThunk {
  return async function (dispatch, getState) {
    try {
      const state = getState();
      assertGenericRequest(state.deeplink.data);

      const genericRequest = state.deeplink.data;
      const currentDetailIndex = state.navigation.currentDetailIndex;
      const currentScreenIndex = state.navigation.currentScreenIndex;
      const inDetour = state.navigation.inDetour;
      const chainId = state.chainMetadata.chainId;

      // Go between screens in a detail to complete it.
      if (currentDetailIndex >= 0) {
        const detail = getDetailByIndex(genericRequest, currentDetailIndex);

        if (detail) {
          const mapEntry = getDetailMapEntry(detail);

          if (currentScreenIndex < mapEntry.screens.length - 1) {
            const nextScreenIndex = currentScreenIndex + 1;
            const nextPath = mapEntry.screens[nextScreenIndex];

            pushCurrentScreenToStack(dispatch, state);
            dispatch(navActions.setCurrentScreenIndex(nextScreenIndex));
            navigateToPath(dispatch, nextPath);
            return;
          }
        }
      }

      // -1 indicates we are before our first detail, so don't try to generate a response.
      if (currentDetailIndex !== -1) {
        await generateAndStoreResponse(genericRequest, currentDetailIndex, dispatch, getState);

        // For detour completion, we need to remove it completely from the navigation stack
        // so that backwards navigation doesn't go back to the detour.
        if (inDetour) {
          // Remove all detour entries from the navigation stack.
          dispatch(navActions.removeStackEntriesByDetailIndex(currentDetailIndex));
          dispatch(navActions.setInDetour(false));

          const updatedStack = getState().navigation.navigationStack;

          if (updatedStack.length > 0) {
            const returnEntry = updatedStack[updatedStack.length - 1];
            dispatch(navActions.popFromNavigationStack());
            dispatch(navActions.setCurrentDetailIndex(returnEntry.detailIndex));
            dispatch(navActions.setCurrentScreenIndex(returnEntry.screenIndex));
            navigateToPath(dispatch, returnEntry.path);
          }

          return;
        }
      }

      // Move to the next detail. This explicitly sets the first detail as index 0
      // just in case we change from -1 as the outside of details index.
      const nextDetailIndex = currentDetailIndex === -1 ? 0 : currentDetailIndex + 1;
      await processNextDetail(genericRequest, nextDetailIndex, chainId, dispatch, getState);
    } catch (e) {
      dispatch(setError(e));
    }
  };
}

/*
 * Thunk for navigating backwards according to the path taken by navigateGenericRequest().
 */
export function navigateBackGenericRequest(): AppThunkSync {
  return function (dispatch, getState) {
    try {
      const state = getState();
      assertGenericRequest(state.deeplink.data);

      const stack = state.navigation.navigationStack;

      if (stack.length === 0) {
        console.warn('Cannot navigate back: navigation stack is empty');
        return;
      }

      const previousEntry = stack[stack.length - 1];

      dispatch(navActions.popFromNavigationStack());
      dispatch(navActions.setCurrentDetailIndex(previousEntry.detailIndex));
      dispatch(navActions.setCurrentScreenIndex(previousEntry.screenIndex));
      navigateToPath(dispatch, previousEntry.path);

      // Re-read state after dispatches to check the current detour status.
      const updatedState = getState();

      if (updatedState.navigation.inDetour) {
        const genericRequest = state.deeplink.data;
        const prevDetail =
          previousEntry.detailIndex >= 0
            ? getDetailByIndex(genericRequest, previousEntry.detailIndex)
            : null;

        if (!prevDetail || getDetailMapEntry(prevDetail).type !== 'detour') {
          dispatch(navActions.setInDetour(false));
        }
      }
    } catch (e) {
      dispatch(setError(e));
    }
  };
}

/*
 * Enters the detour flow for a detour detail at `detourDetailIndex`.
 */
export function startDetour(detourDetailIndex: number): AppThunk {
  return async function (dispatch, getState) {
    try {
      const state = getState();
      assertGenericRequest(state.deeplink.data);

      const genericRequest = state.deeplink.data;
      const detail = getDetailByIndex(genericRequest, detourDetailIndex);

      if (!detail) {
        throw new Error(`No detail found at index ${detourDetailIndex} for detour`);
      }

      const mapEntry = getDetailMapEntry(detail);

      if (mapEntry.type !== 'detour') {
        throw new Error(
          `Detail at index ${detourDetailIndex} is type "${mapEntry.type}", not "detour"`
        );
      }

      if (mapEntry.screens.length === 0) {
        throw new Error(`Detour detail at index ${detourDetailIndex} has no screens`);
      }

      await mapEntry.prepFunction(detail, detourDetailIndex, dispatch, getState);

      // Make sure to save the current screen before entering the detour.
      pushCurrentScreenToStack(dispatch, state);

      dispatch(navActions.setInDetour(true));
      dispatch(navActions.setCurrentDetailIndex(detourDetailIndex));
      dispatch(navActions.setCurrentScreenIndex(0));
      navigateToPath(dispatch, mapEntry.screens[0]);
    } catch (e) {
      dispatch(setError(e));
    }
  };
}
