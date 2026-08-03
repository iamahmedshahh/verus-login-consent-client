import {getApiData} from '#/rpc/callCreator';
import {Identity} from '#/types/identity';
import {API_GET_IDENTITY_CONTENT, NATIVE, POST} from '#/utils/constants';

/**
 * Runs getIdentityContent with a given i-address.
 */
export const getIdentityContent = async (chainId: string, id: string) => {
  try {
    const res = await getApiData(
      NATIVE,
      API_GET_IDENTITY_CONTENT,
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
    throw new Error(e.message);
  }
};
