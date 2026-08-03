import {DeeplinkData} from '#/redux/reducers/deeplink/deeplinkSlice';
import {CompleteRequestResult} from '#/redux/reducers/rpc/rpcSlice';
import {SignatureInfoState} from '#/redux/reducers/signatureInfo/signatureInfoSlice';

export interface ChainInfo {
  longestchain: number;
  blocks: number;
  [key: string]: unknown;
}

export interface ApiErrors {
  [key: string]: Error | null;
}

export interface OriginApp {
  [key: string]: unknown;
}

export interface LoginConsentProps {
  dispatch: (action: unknown) => void;
  path: string;
  pathArray: string[];
  port: number | string | null;
  originAppId: string | null;
  originApp: OriginApp | null;
  originAppBuiltin: boolean | null;
  error: Error | null;
  rpcPassword: string | null;
  windowId: number | string | null;
  deeplinkData: DeeplinkData;
  deeplinkId: string;
  chainInfo: ChainInfo | null;
  apiErrors: ApiErrors;
  chainId: string;
  chainName: string;
  mainChain: string;
  signatureInfo: SignatureInfoState;
}

export interface LoginConsentState {
  requestResult: unknown;
}

export interface ComponentProps {
  pathArray: string[];
  completeLoginConsent: (result?: CompleteRequestResult, error?: Error | null) => Promise<void>;
  requestResult: unknown;
  setRequestResult: (res: unknown, cb: () => void) => void;
  canProcessRequest: () => boolean;
  handleRequest: () => Promise<void>;
  checkRequest: (deeplinkId: string, req: unknown) => Promise<void>;
}
