import {
  AuthenticationRequestOrdinalVDXFObject,
  DataPacketRequestOrdinalVDXFObject,
  GenericRequest,
  IdentityUpdateRequestOrdinalVDXFObject,
  LoginConsentRequest,
  RedirectUri,
  ResponseURI,
  UserDataRequestOrdinalVDXFObject,
} from 'verus-typescript-primitives';

import {Identity} from '#/types/identity';
import {SCOPES, SUPPORTED_CREDENTIALS} from '#/utils/constants';
import {convertFqnToDisplayFormat} from '#/utils/fullyqualifiedname';
import {findIdentityToUpdate} from '#/utils/identity';
import {getVDXFKeyLabel} from '#/utils/vdxfTypeLabels';

export interface ConsentData {
  title: string;
  signerFqn: string;
  permissionsLabels: string[];
  systemId: string;
  expiryLabel?: string;
  constraintsLabels?: string[];
  responseURIsLabels?: string[];
}

export interface PreppedAuthDetail {
  constraintsLabels: string[];
  expiryLabel: string | null;
}

/*
 * extractConsentDataV1 extracts display data from a LoginConsentRequest for the consent screen.
 */
export const extractConsentDataV1 = (
  request: LoginConsentRequest,
  signedBy: Identity
): ConsentData => {
  const signerFqn = convertFqnToDisplayFormat(signedBy.fullyqualifiedname);
  const systemId = request.system_id;

  const requestedPermissions = request.challenge.requested_access;
  const permissionsDescriptions: string[] = [];

  if (requestedPermissions != null) {
    for (const permission of requestedPermissions) {
      if (SCOPES[permission.vdxfkey]) {
        permissionsDescriptions.push(SCOPES[permission.vdxfkey].description);
      } else if (SUPPORTED_CREDENTIALS.includes(permission.vdxfkey)) {
        permissionsDescriptions.push('Get ' + getVDXFKeyLabel(permission.vdxfkey) + ' credential');
      }
    }
  }

  const responseURIsLabels = request.challenge.redirect_uris.map((uri: RedirectUri) => uri.uri);

  return {
    title: `${signerFqn} is requesting login with VerusID`,
    signerFqn,
    permissionsLabels: permissionsDescriptions,
    systemId,
    responseURIsLabels,
  };
};

/*
 * extractConsentDataV2 extracts display data from a GenericRequest for the consent screen.
 */
export const extractConsentDataV2 = (
  request: GenericRequest,
  signedBy: Identity,
  currentDetailIndex: number,
  appOrDelegatedId?: Identity | null,
  preppedAuthDetail?: PreppedAuthDetail | null,
  identities: Identity[] = []
): ConsentData => {
  const signerFqn = convertFqnToDisplayFormat(signedBy.fullyqualifiedname);
  const systemId = request.signature?.systemID.toIAddress() || '';

  // The generic request doesn't use permission labels since each detail displays their own info.
  const permissionsLabels = [];

  // If the first detail is an authentication detail, then we can extract information
  // from it to display with the generic request's overview.
  const ordinalWrapper = request.details[currentDetailIndex];

  let expiryLabel: string;
  let constraintsLabels: string[] = [];

  let title = `${signerFqn} is requesting login with VerusID`;

  if (ordinalWrapper instanceof AuthenticationRequestOrdinalVDXFObject) {
    if (preppedAuthDetail) {
      constraintsLabels = preppedAuthDetail.constraintsLabels;
      expiryLabel = preppedAuthDetail.expiryLabel;
    }
  } else if (ordinalWrapper instanceof IdentityUpdateRequestOrdinalVDXFObject) {
    // The first detail is prepared before this overview, so the identity is in the wallet.
    const identityToUpdate = findIdentityToUpdate(request, ordinalWrapper.data, identities);
    const identityName = convertFqnToDisplayFormat(identityToUpdate.fullyqualifiedname);

    title = `${signerFqn} is requesting to update ${identityName}`;
  } else if (ordinalWrapper instanceof DataPacketRequestOrdinalVDXFObject) {
    // Without a sign-in this is not a login, so name the request like Verus Mobile does.
    title = `${signerFqn} is requesting signatures over data`;
  } else if (ordinalWrapper instanceof UserDataRequestOrdinalVDXFObject) {
    title = `${signerFqn} is requesting credential data from your identity`;
  }

  const responseURIs = request.responseURIs ?? [];
  const responseURIsLabels = responseURIs.map((uri: ResponseURI) => uri.getUriString());

  if (request.hasAppOrDelegatorID() && appOrDelegatedId) {
    title += ` on behalf of ${convertFqnToDisplayFormat(appOrDelegatedId.fullyqualifiedname)}`;
  }

  return {
    title,
    signerFqn,
    permissionsLabels,
    systemId,
    expiryLabel,
    constraintsLabels,
    responseURIsLabels,
  };
};
