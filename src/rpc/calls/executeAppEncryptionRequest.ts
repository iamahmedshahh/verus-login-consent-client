import {AppEncryptionRequestDetails} from 'verus-typescript-primitives';

import {getApiData} from '#/rpc/callCreator';
import {API_EXECUTE_APP_ENCRYPTION_REQUEST, NATIVE, POST} from '#/utils/constants';

export interface AppEncryptionResult {
  incomingViewingKey: string;
  extendedViewingKey: string;
  address: string;
  extendedSpendingKey?: string;
}

export const executeAppEncryptionRequest = async (
  chainId: string,
  detail: AppEncryptionRequestDetails,
  fromID: string,
  toID: string
): Promise<AppEncryptionResult> => {
  try {
    const res = await getApiData(
      NATIVE,
      API_EXECUTE_APP_ENCRYPTION_REQUEST,
      {
        chainTicker: chainId,
        detailJSON: detail.toJson(),
        fromID,
        toID,
      },
      POST,
      true
    );
    if (res.msg !== 'success') throw new Error(res.result);
    else return res.result as AppEncryptionResult;
  } catch (e) {
    console.error(e.message);
    throw new Error(e.message);
  }
};
