import {DataDescriptorJson} from 'verus-typescript-primitives';

import {getApiData} from '#/rpc/callCreator';
import {API_ENCRYPT_GENERIC_RESPONSE_DETAILS, NATIVE, POST} from '#/utils/constants';

export const encryptGenericResponseDetails = async (
  chainId: string,
  details: Buffer,
  identity: string,
  zaddress: string
): Promise<DataDescriptorJson> => {
  try {
    const res = await getApiData(
      NATIVE,
      API_ENCRYPT_GENERIC_RESPONSE_DETAILS,
      {
        chainTicker: chainId,
        detailsHex: details.toString('hex'),
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
