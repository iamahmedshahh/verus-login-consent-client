import {
  DataDescriptor,
  DataDescriptorOrdinalVDXFObject,
  GenericRequest,
  GenericResponse,
} from 'verus-typescript-primitives';

import {encryptGenericResponseDetails} from '#/rpc/calls/encryptGenericResponseDetails';

/*
 * Encrypts all of the response's details to the request's encryptResponseToAddress, the same way
 * Verus Mobile does (encryptGenericResponseDetails.js). Call it before signing, so the signature
 * covers the encrypted details.
 */
export async function encryptResponseDetails(
  request: GenericRequest,
  response: GenericResponse,
  chainId: string,
  identityAddress: string
): Promise<GenericResponse> {
  if (
    !request.hasEncryptResponseToAddress() ||
    !response.details ||
    response.details.length === 0 ||
    response.detailsAreEncrypted()
  ) {
    return response;
  }

  const hadMultiDetails = response.hasMultiDetails() || response.details.length > 1;
  response.setFlags();

  const encryptedDescriptorJson = await encryptGenericResponseDetails(
    chainId,
    response.getDetailsBuffer(),
    identityAddress,
    request.encryptResponseToAddress.toAddressString()
  );
  const encryptedDescriptor = DataDescriptor.fromJson(encryptedDescriptorJson);

  if (!encryptedDescriptor.hasEncryptedData()) {
    throw new Error('The response details could not be encrypted.');
  }

  response.details = [new DataDescriptorOrdinalVDXFObject({data: encryptedDescriptor})];
  response.flags = response.flags.or(GenericResponse.FLAG_DETAILS_ARE_ENCRYPTED);
  // The reader needs to know the encrypted bytes hold a list of details.
  if (hadMultiDetails) response.flags = response.flags.or(GenericResponse.FLAG_MULTI_DETAILS);
  response.setFlags();

  return response;
}
