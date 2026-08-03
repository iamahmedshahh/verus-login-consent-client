import {
  CompactIAddressObject,
  GenericRequest,
  GenericResponse,
  OrdinalVDXFObject,
  VerifiableSignatureData,
} from 'verus-typescript-primitives';

import {AppThunk} from '#/redux/hooks';
import {setError} from '#/redux/reducers/error/error.actions';
import {completeRequest} from '#/redux/reducers/rpc/rpcSlice';
import {signGenericResponse} from '#/rpc/calls/signGenericResponse';
import {Identity} from '#/types/identity';
import BN from '#/utils/bn-polyfill';

import {selectAllResponseDetails} from './genericResponseSlice';

export function finalizeGenericRequest(genericRequest: GenericRequest, chainId: string): AppThunk {
  return async function (dispatch, getState) {
    try {
      const state = getState();
      const responseDetails = selectAllResponseDetails(state);
      responseDetails.sort((a, b) => a.index - b.index);

      const ordinals = responseDetails.map(
        detail => OrdinalVDXFObject.createFromBuffer(Buffer.from(detail.hexBuffer, 'hex')).obj
      );

      // For requests that are for identity updates with no authentication details,
      // there is no active identity. Instead use the identity that was updated.
      const signingIdentity = state.identity.activeIdentity as Identity;
      const systemAddress = signingIdentity.identity.systemid;
      const identityAddress = signingIdentity.identity.identityaddress;

      const signature = new VerifiableSignatureData({
        systemID: new CompactIAddressObject({
          type: CompactIAddressObject.TYPE_I_ADDRESS,
          address: systemAddress,
        }),
        identityID: new CompactIAddressObject({
          type: CompactIAddressObject.TYPE_I_ADDRESS,
          address: identityAddress,
        }),
      });

      const response = new GenericResponse({
        requestID: genericRequest.requestID,
        requestHash: genericRequest.getRawDataSha256(),
        details: ordinals,
        signature,
        createdAt: new BN((Date.now() / 1000).toFixed(0)),
      });

      response.setSigned();

      const signedResponse = await signGenericResponse(chainId, response);

      dispatch(
        completeRequest({
          type: 'v2',
          response: signedResponse,
          uris: genericRequest.responseURIs || [],
        })
      );
    } catch (e) {
      console.error('Error finalizing generic request:', e);
      dispatch(setError(e as Error));
    }
  };
}
