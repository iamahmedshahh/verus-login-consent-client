import {createEntityAdapter, createSlice} from '@reduxjs/toolkit';
import {CredentialJson} from 'verus-typescript-primitives';

import {SET_ACTIVE_IDENTITY} from '#/redux/reducers/identity/identity.types';
import {RootState} from '#/redux/store';

interface UserData {
  index: number;
  data: CredentialJson[]; // Store the data as JSON to meet Redux best practices.
}

const userDataAdapter = createEntityAdapter<UserData>({
  selectId: detail => detail.index,
});

const userDataSlice = createSlice({
  name: 'userData',
  initialState: userDataAdapter.getInitialState(),
  reducers: {
    detailAdded: userDataAdapter.addOne,
    detailUpdated: userDataAdapter.updateOne,
  },
  extraReducers: builder => {
    // Clear the stored user data if the user is switched to force fetching.
    builder.addCase(SET_ACTIVE_IDENTITY, state => {
      userDataAdapter.removeAll(state);
    });
  },
});

export const {selectById: selectDetailById, selectTotal: selectDetailCount} =
  userDataAdapter.getSelectors((state: RootState) => state.genericRequest.userData);

export const {detailAdded, detailUpdated} = userDataSlice.actions;
export default userDataSlice.reducer;
