import {
  SET_CHAIN_METADATA,
  SET_MAIN_CHAIN,
  SetChainMetadataAction,
  SetMainChainAction
} from './chainMetadata.types';

export const setChainMetadata = (chainMetadata: {
  chainId?: string;
  chainName?: string;
}): SetChainMetadataAction => ({
  type: SET_CHAIN_METADATA,
  payload: chainMetadata
});

export const setMainChain = (mainChain: string): SetMainChainAction => ({
  type: SET_MAIN_CHAIN,
  payload: mainChain
});