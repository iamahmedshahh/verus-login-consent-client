import {Identity} from '#/types/identity';

import {convertFqnToDisplayFormat} from './fullyqualifiedname';

export const createIdentityDescriptor = (identity: Identity, overrideFqn?: string): string => {
  if (!identity) return '-';

  const fqn = overrideFqn || identity.fullyqualifiedname;
  const displayFqn = convertFqnToDisplayFormat(fqn);
  const address = identity.identity?.identityaddress || 'Unknown';

  return `${displayFqn} (${address})`;
};
