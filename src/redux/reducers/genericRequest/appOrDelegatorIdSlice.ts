import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {Identity} from '#/types/identity';

export interface AppOrDelegatorIdState {
  identity: Identity | null;
}

const initialState: AppOrDelegatorIdState = {
  identity: null,
};

const appOrDelegatorIdSlice = createSlice({
  name: 'appOrDelegatorId',
  initialState,
  reducers: {
    setAppOrDelegatorId: (_state, action: PayloadAction<Identity>) => ({
      identity : action.payload,
    }),
    clearAppOrDelegatorId: state => {
      state.identity = null;
    },
  },
});

export const {setAppOrDelegatorId, clearAppOrDelegatorId} = appOrDelegatorIdSlice.actions;
export default appOrDelegatorIdSlice.reducer;
