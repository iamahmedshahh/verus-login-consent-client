import {GenericRequest, IdentityUpdateRequestDetails} from 'verus-typescript-primitives';

import {Identity} from '#/types/identity';

import {convertFqnToDisplayFormat} from './fullyqualifiedname';

export const createIdentityDescriptor = (identity: Identity, overrideFqn?: string): string => {
  if (!identity) return '-';

  const fqn = overrideFqn || identity.fullyqualifiedname;
  const displayFqn = convertFqnToDisplayFormat(fqn);
  const address = identity.identity?.identityaddress || 'Unknown';

  return `${displayFqn} (${address})`;
};

/*
 * findIdentityToUpdate finds the wallet identity that an identity update detail changes by its
 * address, like Verus Mobile, since a sub-ID can have the same name as another identity.
 */
export const findIdentityToUpdate = (
  request: GenericRequest,
  detail: IdentityUpdateRequestDetails,
  identities: Identity[]
): Identity | undefined => {
  const identityAddress = detail.getIdentityAddress(request.isTestnet());

  return identities.find(id => id.identity.identityaddress === identityAddress);
};
