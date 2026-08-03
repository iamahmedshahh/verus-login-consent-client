import {GenericResponse} from 'verus-typescript-primitives';

import {getApiData} from '#/rpc/callCreator';
import {API_SIGN_GENERIC_RESPONSE, NATIVE, POST} from '#/utils/constants';

export const signGenericResponse = async (
  chainId: string,
  response: GenericResponse
): Promise<GenericResponse> => {
  try {
    const res = await getApiData(
      NATIVE,
      API_SIGN_GENERIC_RESPONSE,
      {
        chainTicker: chainId,
        response: response.toBuffer().toString('hex'),
      },
      POST,
      true
    );
    if (res.msg !== 'success') throw new Error(res.result);
    else {
      const resultResponse = new GenericResponse();
      resultResponse.fromBuffer(Buffer.from(res.result, 'hex'));
      return resultResponse;
    }
  } catch (e) {
    console.error(e.message);
    throw new Error(e.message);
  }
};
