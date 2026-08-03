import {createEntityAdapter, createSlice} from '@reduxjs/toolkit';

import {RootState} from '#/redux/store';

interface ResponseDetail {
  index: number;
  hexBuffer: string;
}

const responseDetailsAdapter = createEntityAdapter<ResponseDetail>({
  selectId: (detail: ResponseDetail) => detail.index,
});

const responseDetailsSlice = createSlice({
  name: 'responseDetails',
  initialState: responseDetailsAdapter.getInitialState(),
  reducers: {
    upsertResponseDetail: responseDetailsAdapter.upsertOne,
    removeResponseDetail: responseDetailsAdapter.removeOne,
  },
});

const responseDetailsSelectors = responseDetailsAdapter.getSelectors(
  (state: RootState) => state.genericResponse
);
export const selectAllResponseDetails = responseDetailsSelectors.selectAll;

export const {upsertResponseDetail, removeResponseDetail} = responseDetailsSlice.actions;
export const genericResponse = responseDetailsSlice.reducer;
