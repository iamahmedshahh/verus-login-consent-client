import {getApiData} from '#/rpc/callCreator';
import {API_SIGN_DATA, NATIVE, POST} from '#/utils/constants';

interface ApiResponse {
  msg: string;
  result: SignDataResult;
}

export interface SignDataParams {
  address: string;
  message?: string;
  messagehex?: string;
  datahash?: string;
}

export interface SignatureDataInfo {
  version: number;
  systemid: string;
  hashtype: number;
  signaturehash: string;
  identityid: string;
  signaturetype: number;
  signature: string;
}

export interface SignDataResult {
  signaturedata: SignatureDataInfo;
  system: string;
  systemid: string;
  hashtype: string;
  hash: string;
  identity: string;
  canonicalname: string;
  address: string;
  signatureheight: number;
  signatureversion: number;
  signature: string;
}

export async function signData(chainId: string, params: SignDataParams): Promise<SignDataResult> {
  try {
    const res = (await getApiData(
      NATIVE,
      API_SIGN_DATA,
      {
        chainTicker: chainId,
        params: params,
      },
      POST,
      true
    )) as ApiResponse;

    if (res.msg !== 'success') {
      throw new Error(String(res.result));
    }

    return res.result;
  } catch (e) {
    const error = e as Error;
    console.error(error.message);
    throw new Error(error.message);
  }
}
