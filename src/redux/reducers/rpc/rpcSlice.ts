import {createSlice, PayloadAction, ThunkAction} from '@reduxjs/toolkit';
import {
  GenericResponse,
  LoginConsentResponse,
  ResponseURI,
  ResponseURIJson,
} from 'verus-typescript-primitives';

import {setError} from '#/redux/reducers/error/error.actions';
import {RootState} from '#/redux/store';
import {closePlugin} from '#/rpc/calls/closePlugin';
import {VERUS_LOGIN_CONSENT_UI} from '#/utils/constants';

export interface RpcState {
  port: number | string | null;
  password: string | null;
  expiryMargin: number;
  appId: string;
  calledTimes: number[];
  postEncryption: boolean;
  windowId: number | null;
}

// Unknown units.
const DEFAULT_EXPIRY_MARGIN = 60000;

const initialState: RpcState = {
  port: null,
  password: null,
  expiryMargin: DEFAULT_EXPIRY_MARGIN,
  appId: VERUS_LOGIN_CONSENT_UI,
  calledTimes: [],
  postEncryption: true,
  windowId: null,
};

const rpcSlice = createSlice({
  name: 'rpc',
  initialState,
  reducers: {
    setRpcAppId: (state, action: PayloadAction<string>) => {
      state.appId = action.payload;
    },
    setRpcPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
    },
    setRpcPort: (state, action: PayloadAction<number | string>) => {
      state.port = action.payload;
    },
    setRpcExpiryMargin: (state, action: PayloadAction<number>) => {
      state.expiryMargin = action.payload;
    },
    setRpcPostEncryption: (state, action: PayloadAction<boolean>) => {
      state.postEncryption = action.payload;
    },
    setRpcWindowId: (state, action: PayloadAction<number>) => {
      state.windowId = action.payload;
    },
    addCalledTime: (state, action: PayloadAction<number>) => {
      const time = action.payload;

      const minTime = time - state.expiryMargin;
      const maxTime = time + state.expiryMargin;

      // Remove all non-recent times.
      state.calledTimes = state.calledTimes.filter(
        existingTime => existingTime > minTime && existingTime < maxTime
      );

      state.calledTimes.push(time);
    },
  },
});

type Redirect = {
  type: string;
  uri: string;
};

type SingleURIResult = {
  type: 'v1';
  responseKey: string;
  response: LoginConsentResponse;
  redirect: Redirect;
};

type MultiURIResult = {
  type: 'v2';
  response: GenericResponse;
  uris: ResponseURI[];
};

type MultiURIResultSerialized = {
  type: 'v2';
  response: string;
  uris: ResponseURIJson[];
};

export type CompleteRequestResult = SingleURIResult | MultiURIResult;

type SerializedResult = SingleURIResult | MultiURIResultSerialized;

// With v2, the response and URIs need to be serialized before sending over by IPC.
function serializeMultiURIResult(result: MultiURIResult): MultiURIResultSerialized {
  return {
    type: result.type,
    response: result.response.toBuffer().toString('hex'),
    uris: result.uris.map(uri => uri.toJson()),
  };
}

function serializeResult(result: CompleteRequestResult): SerializedResult {
  if (result.type === 'v2') {
    return serializeMultiURIResult(result);
  }
  return result;
}

export function completeRequest(
  result?: CompleteRequestResult,
  error?: Error
): ThunkAction<Promise<void>, RootState, unknown, ReturnType<typeof setError>> {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const windowId = state.rpc.windowId;

      const finalResult = result ? serializeResult(result) : undefined;

      await closePlugin(
        VERUS_LOGIN_CONSENT_UI,
        windowId,
        true,
        finalResult ?? {error: error?.message ?? error}
      );
    } catch (e: unknown) {
      dispatch(setError(e));
    }
  };
}

export const {
  setRpcAppId,
  setRpcPassword,
  setRpcPort,
  setRpcExpiryMargin,
  setRpcPostEncryption,
  setRpcWindowId,
  addCalledTime,
} = rpcSlice.actions;

export const rpc = rpcSlice.reducer;
