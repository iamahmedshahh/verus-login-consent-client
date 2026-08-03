import {createEntityAdapter, createSlice} from '@reduxjs/toolkit';

import {RootState} from '#/redux/store';

interface AuthDetail {
  index: number;
  constraintsLabels: string[];
  expiryLabel: string | null;
}

const authDetailsAdapter = createEntityAdapter<AuthDetail>({
  selectId: detail => detail.index,
});

const authDetailsSlice = createSlice({
  name: 'authDetails',
  initialState: authDetailsAdapter.getInitialState(),
  reducers: {
    detailAdded: authDetailsAdapter.addOne,
    detailsReceived: authDetailsAdapter.setMany,
    detailUpdated: authDetailsAdapter.updateOne,
  },
});

export const {selectById: selectDetailById, selectTotal: selectDetailCount} =
  authDetailsAdapter.getSelectors((state: RootState) => state.genericRequest.authDetails);

export const {detailAdded, detailsReceived} = authDetailsSlice.actions;
export default authDetailsSlice.reducer;
