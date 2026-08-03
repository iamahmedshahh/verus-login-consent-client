import {GenericRequest, VERUSPAY_INVOICE_DETAILS_VDXF_ORDINAL} from 'verus-typescript-primitives';
import {VerusIdInterface} from 'verusid-ts-client';

import {RootState} from '#/redux/store';
import {verifyGenericRequest} from '#/rpc/calls/verifyGenericRequest';
import {Identity} from '#/types/identity';

/*
 * Checks the validity of a generic request and throws errors for any issues found.
 */
export async function checkGenericRequest(
  chainId: string,
  request: GenericRequest,
  getState: () => RootState
) {
  if (!request.isValidVersion()) {
    throw new Error(`The request version ${request.version} is unsupported.`);
  }

  if (request.details.length === 0) {
    throw new Error('The request contains no details.');
  }

  if (!VerusIdInterface.validateUnsignedGenericRequest(request)) {
    throw new Error('The detail structure within the request is not valid.');
  }

  if (!request.isSigned()) {
    // Only generic requests with VerusPay invoices are allowed to be unsigned.
    if (
      request.hasMultiDetails() ||
      !request.details[0].type.eq(VERUSPAY_INVOICE_DETAILS_VDXF_ORDINAL)
    ) {
      throw new Error('The request is not signed.');
    }

    if (request.hasAppOrDelegatedID()) {
      throw new Error('The request has an app or delegated ID and must be signed.');
    }
  } else {
    // Verify the signature of the generic request.
    const verificationResult = await verifyGenericRequest(chainId, request);
    if (!verificationResult.verified) {
      throw new Error(verificationResult.message);
    }

    if (request.hasAppOrDelegatedID()) {
      // Check the signing identity is in the wallet, so that the appOrDelegatedId is allowed
      const signingId = request.signature.identityID.toIAddress();
      const identities = getState().identity.identities as Identity[];
      const found = identities.find(id => {
        return id.identity.identityaddress === signingId;
      });

      if (!found) {
        throw new Error(
          `The signing identity is not in the wallet, so having an app or delegated ID is not allowed.`
        );
      }
    }
  }
}
