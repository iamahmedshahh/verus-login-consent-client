import {RecipientConstraint} from 'verus-typescript-primitives';

import {getIdentity} from '#/rpc/calls/getIdentity';
import {Identity} from '#/types/identity';
import {convertFqnToDisplayFormat} from '#/utils/fullyqualifiedname';
import {SYSTEM_ID_TO_NAME} from '#/utils/systems';

export function getConstraintAddress(constraint: RecipientConstraint): string {
  try {
    return constraint.identity.toIAddress();
  } catch {
    return constraint.identity.address;
  }
}

export function getConstraintDisplayName(
  constraintType: number,
  constraintAddress: string,
  friendlyNames: Record<string, string>
): string {
  if (friendlyNames[constraintAddress]) {
    return friendlyNames[constraintAddress];
  }

  // Friendly names already include the systems, so if we reach this point
  // it's an unknown system.
  if (constraintType === RecipientConstraint.REQUIRED_SYSTEM) {
    return 'Unknown system';
  }

  if (constraintAddress.endsWith('@')) {
    return constraintAddress;
  }

  return 'Unknown identity';
}

export async function resolveConstraintFriendlyNames(
  chainId: string,
  constraints: RecipientConstraint[],
  signerIdentity: Identity | null,
  signingRevocationIdentity: Identity | null,
  signingRecoveryIdentity: Identity | null
): Promise<Record<string, string>> {
  const names: Record<string, string> = {...SYSTEM_ID_TO_NAME};

  const constraintAddresses = Array.from(new Set(constraints.map(getConstraintAddress)));

  for (const identity of [
    signerIdentity,
    signingRevocationIdentity,
    signingRecoveryIdentity,
  ].filter((x): x is Identity => x != null)) {
    names[identity.identity.identityaddress] = convertFqnToDisplayFormat(
      identity.fullyqualifiedname
    );
  }

  // Avoid fetching a system ID that is in SYSTEM_ID_TO_NAME.
  const addressesToFetch = Array.from(
    new Set([...(signerIdentity ? [signerIdentity.identity.systemid] : []), ...constraintAddresses])
  );

  const fetchResults = await Promise.allSettled(
    addressesToFetch
      .filter(addr => !names[addr])
      .map(addr => getIdentity(chainId, addr).then(identity => ({addr, identity})))
  );

  for (const result of fetchResults) {
    if (result.status === 'fulfilled' && result.value.identity.fullyqualifiedname) {
      names[result.value.addr] = convertFqnToDisplayFormat(
        result.value.identity.fullyqualifiedname
      );
    }
  }

  return names;
}

export function getConstraintLabel(
  constraint: RecipientConstraint,
  friendlyNames: Record<string, string>
): string {
  const constraintAddress = getConstraintAddress(constraint);
  const displayName = getConstraintDisplayName(constraint.type, constraintAddress, friendlyNames);

  switch (constraint.type) {
    case RecipientConstraint.REQUIRED_ID:
      return `Required identity: ${displayName}`;
    case RecipientConstraint.REQUIRED_SYSTEM:
      return `Required system: ${displayName}`;
    case RecipientConstraint.REQUIRED_PARENT:
      return `Required parent: ${displayName}`;
    default:
      return `Constraint: ${displayName}`;
  }
}
