import {AppEncryptionResponseDetails, DataDescriptorJson} from 'verus-typescript-primitives';

import {getApiData} from '#/rpc/callCreator';
import {API_ENCRYPT_APP_ENCRYPTION_RESPONSE, NATIVE, POST} from '#/utils/constants';

export const encryptAppEncryptionResponse = async (
  chainId: string,
  detail: AppEncryptionResponseDetails,
  identity: string,
  zaddress: string
): Promise<DataDescriptorJson> => {
  try {
    const res = await getApiData(
      NATIVE,
      API_ENCRYPT_APP_ENCRYPTION_RESPONSE,
      {
        chainTicker: chainId,
        detailJSON: detail.toJson(),
        identity,
        zaddress,
      },
      POST,
      true
    );
    if (res.msg !== 'success') throw new Error(res.result);
    else return res.result as DataDescriptorJson;
  } catch (e) {
    console.error(e.message);
    throw new Error(e.message);
  }
};
