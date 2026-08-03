import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {BlockInfo} from 'verus-typescript-primitives/dist/block/BlockInfo';

import {Identity} from '#/types/identity';

export interface SignatureInfoState {
  signedBy: Identity | null;
  sigBlockInfo: BlockInfo | null;
  signingRevocationIdentity: Identity | null;
  signingRecoveryIdentity: Identity | null;
}

const initialState: SignatureInfoState = {
  signedBy: null,
  sigBlockInfo: null,
  signingRevocationIdentity: null,
  signingRecoveryIdentity: null,
};

const signatureInfoSlice = createSlice({
  name: 'signatureInfo',
  initialState,
  reducers: {
    setSignatureInfo: (
      state,
      action: PayloadAction<{
        signedBy?: Identity;
        sigBlockInfo?: BlockInfo;
        signingRevocationIdentity?: Identity;
        signingRecoveryIdentity?: Identity;
      }>
    ) => {
      if (action.payload.signedBy !== undefined) state.signedBy = action.payload.signedBy;
      if (action.payload.sigBlockInfo !== undefined)
        state.sigBlockInfo = action.payload.sigBlockInfo;
      if (action.payload.signingRevocationIdentity !== undefined)
        state.signingRevocationIdentity = action.payload.signingRevocationIdentity;
      if (action.payload.signingRecoveryIdentity !== undefined)
        state.signingRecoveryIdentity = action.payload.signingRecoveryIdentity;
    },
  },
});

export const {setSignatureInfo} = signatureInfoSlice.actions;
export const signatureInfo = signatureInfoSlice.reducer;
