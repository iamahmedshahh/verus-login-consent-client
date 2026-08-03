import {Credential} from 'verus-typescript-primitives';

import {getApiData} from '#/rpc/callCreator';
import {API_GET_CREDENTIALS_BY_SCOPE, NATIVE, POST} from '#/utils/constants';

interface ApiResponse {
  msg: string;
  result: unknown;
}

export async function getCredentialsByScope(
  chainId: string,
  address: string,
  scope: string,
  credentialKeys: string[]
): Promise<Credential[]> {
  try {
    const res = (await getApiData(
      NATIVE,
      API_GET_CREDENTIALS_BY_SCOPE,
      {
        coin: chainId,
        address: address,
        scope: scope,
        credentialKeys: credentialKeys,
      },
      POST,
      true
    )) as ApiResponse;

    if (res.msg !== 'success') {
      throw new Error(res.result as string);
    }

    const credentialArray = res.result as Array<Record<string, unknown>>;

    return credentialArray.map(credentialData => new Credential(credentialData));
  } catch (e) {
    const error = e as Error;
    console.error(error.message);
    throw new Error(error.message);
  }
}
