export const SET_CHAIN_METADATA = 'SET_CHAIN_METADATA' as const;
export const SET_MAIN_CHAIN = 'SET_MAIN_CHAIN' as const;

export type ChainMetadataActionTypes = typeof SET_CHAIN_METADATA | typeof SET_MAIN_CHAIN;

export interface SetChainMetadataAction {
  type: typeof SET_CHAIN_METADATA;
  payload: {
    chainId?: string;
    chainName?: string;
  };
}

export interface SetMainChainAction {
  type: typeof SET_MAIN_CHAIN;
  payload: string;
}

export type ChainMetadataAction = SetChainMetadataAction | SetMainChainAction;

export interface ChainMetadataState {
  chainId: string;
  chainName: string;
  mainChain: string;
}
