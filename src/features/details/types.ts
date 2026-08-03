import {GenericRequest, OrdinalVDXFObject} from 'verus-typescript-primitives';

import {AppDispatch, RootState} from '#/redux/store';

export type DetailResponse = OrdinalVDXFObject | null;

export type DetailPrepFunction = (
  ordinal: OrdinalVDXFObject,
  detailIndex: number,
  dispatch: AppDispatch,
  getState: () => RootState
) => Promise<void>;

export type DetailResponseGenerator = (
  request: GenericRequest,
  detailIndex: number,
  getState: () => RootState
) => Promise<DetailResponse>;

export type DetailType = 'standard' | 'headless' | 'detour';

export interface DetailMapEntry {
  type: DetailType;
  prepFunction: DetailPrepFunction;
  screens: string[];
  responseGenerator: DetailResponseGenerator;
}

export interface NavigationStackEntry {
  path: string;
  detailIndex: number;
  screenIndex: number;
}
