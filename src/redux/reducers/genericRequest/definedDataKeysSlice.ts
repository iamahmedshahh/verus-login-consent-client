import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface DefinedDataKey {
  vdxfuri: string;
  nsid: string;
  label: string;
}

export interface DefinedDataKeysState {
  keys: Record<string, DefinedDataKey> | null;
}

const initialState: DefinedDataKeysState = {
  keys: null,
};

const definedDataKeysSlice = createSlice({
  name: 'definedDataKeys',
  initialState,
  reducers: {
    setDefinedDataKeys: (state, action: PayloadAction<Record<string, DefinedDataKey>>) => {
      state.keys = action.payload;
    },
    clearDefinedDataKeys: state => {
      state.keys = null;
    },
  },
});

export const {setDefinedDataKeys, clearDefinedDataKeys} = definedDataKeysSlice.actions;
export default definedDataKeysSlice.reducer;
