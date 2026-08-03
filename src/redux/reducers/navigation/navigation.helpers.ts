import {GenericRequest} from 'verus-typescript-primitives';

import {generateDetailResponse} from '#/features/details';
import {DeeplinkData} from '#/redux/reducers/deeplink/deeplinkSlice';
import {
  removeResponseDetail,
  upsertResponseDetail,
} from '#/redux/reducers/genericResponse/genericResponseSlice';
import {AppDispatch, RootState} from '#/redux/store';

import {readNavigationPath} from './navigation.util';
import {actions} from './navigationSlice';

export function isGenericRequest(data: DeeplinkData): data is GenericRequest {
  return data instanceof GenericRequest;
}

export function assertGenericRequest(data: DeeplinkData): asserts data is GenericRequest {
  if (!isGenericRequest(data)) {
    throw new Error('Expected GenericRequest but received a different deeplink type');
  }
}

export function navigateToPath(dispatch: AppDispatch, path: string): void {
  dispatch(
    actions.setNavigationPath({
      navigationPath: path,
      navigationPathArray: readNavigationPath(path),
    })
  );
}

export function pushCurrentScreenToStack(dispatch: AppDispatch, state: RootState): void {
  dispatch(
    actions.pushToNavigationStack({
      path: state.navigation.path,
      detailIndex: state.navigation.currentDetailIndex,
      screenIndex: state.navigation.currentScreenIndex,
    })
  );
}

export async function generateAndStoreResponse(
  genericRequest: GenericRequest,
  detailIndex: number,
  dispatch: AppDispatch,
  getState: () => RootState
): Promise<void> {
  const responseToAdd = await generateDetailResponse(genericRequest, detailIndex, getState);

  if (responseToAdd) {
    const buffer = Buffer.isBuffer(responseToAdd) ? responseToAdd : responseToAdd.toBuffer();
    const detailHexBuffer = buffer.toString('hex');
    dispatch(upsertResponseDetail({index: detailIndex, hexBuffer: detailHexBuffer}));
  } else {
    dispatch(removeResponseDetail(detailIndex));
  }
}
