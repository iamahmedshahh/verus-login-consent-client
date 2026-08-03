import {getApiData} from '#/rpc/callCreator';
import {Identity} from '#/types/identity';
import {API_GET_IDENTITY, NATIVE, POST} from '#/utils/constants';

/**
 * Runs getIdentity with a given i-address.
 */
export const getIdentity = async (chainId: string, id: string) => {
  try {
    const res = await getApiData(
      NATIVE,
      API_GET_IDENTITY,
      {
        chainTicker: chainId,
        name: id,
      },
      POST,
      true
    );

    if (res.msg !== 'success') {
      throw new Error(res.result);
    }

    return res.result as Identity;
  } catch (e) {
    // Don't console log the error since the error can be used to determine if
    // an identity already exists when provisioning.
    throw new Error(e.message);
  }
};
