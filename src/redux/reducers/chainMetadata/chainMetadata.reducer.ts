/*
  This reducer contains information about what chains are being used.
*/
import {
  SET_CHAIN_METADATA,
  SET_MAIN_CHAIN,
  ChainMetadataState,
  ChainMetadataAction
} from './chainMetadata.types';

const initialState: ChainMetadataState = {
  chainId: '',
  chainName: '',
  mainChain: '',
};

export const chainMetadata = (state = initialState, action: ChainMetadataAction): ChainMetadataState => {
  switch (action.type) {
  case SET_CHAIN_METADATA:
    return {
      ...state,
      ...action.payload
    };
  case SET_MAIN_CHAIN:
    return {
      ...state,
      mainChain: action.payload
    };
  default:
    return state;
  }
};

export default chainMetadata;