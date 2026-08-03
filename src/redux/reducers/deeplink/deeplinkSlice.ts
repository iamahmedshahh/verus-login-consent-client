/*
  This reducer contains the deeplink information, including the
  type of deeplink (id) and the data associated with it.
*/
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {GenericRequest, LoginConsentRequest, VerusPayInvoice} from 'verus-typescript-primitives';

export type DeeplinkData = LoginConsentRequest | VerusPayInvoice | GenericRequest;

export interface DeeplinkState {
  id: string;
  data: DeeplinkData | null;
}

const initialState: DeeplinkState = {
  id: '',
  data: null,
};

const deeplinkSlice = createSlice({
  name: 'deeplink',
  initialState,
  reducers: {
    setDeeplinkData: (state, action: PayloadAction<{id: string; data: DeeplinkData}>) => {
      state.id = action.payload.id;
      state.data = action.payload.data;
    },
  },
});

export const {setDeeplinkData} = deeplinkSlice.actions;
export const deeplink = deeplinkSlice.reducer;
