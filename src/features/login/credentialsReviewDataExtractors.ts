import {
  Credential,
  GenericRequest,
  LoginConsentRequest,
  UserDataRequestOrdinalVDXFObject,
} from 'verus-typescript-primitives';

import {selectDetailById} from '#/redux/reducers/genericRequest/userDataSlice';
import {RootState} from '#/redux/store';
import {Identity} from '#/types/identity';
import {SUPPORTED_CREDENTIALS} from '#/utils/constants';
import {convertFqnToDisplayFormat} from '#/utils/fullyqualifiedname';
import {getVDXFKeyLabel} from '#/utils/vdxfTypeLabels';

export interface CredentialsReviewData {
  signerFqn: string;
  requestedCredentialKeys: string[];
  fetchedCredentialKeys: string[];
  missingCredentialKeys: string[];
  missingCredentialLabels: string[];
  credentials: Credential[];
}

export const selectUserDataCredentials = (
  state: RootState,
  currentDetailIndex: number
): Credential[] => {
  const detail = selectDetailById(state, currentDetailIndex);
  if (!detail || !detail.data || !Array.isArray(detail.data)) {
    return [];
  }
  return detail.data.map(credJson => Credential.fromJson(credJson));
};

export const processCredentialsReviewData = (
  signerFqn: string,
  requestedCredentialKeys: string[],
  credentials: Credential[]
): CredentialsReviewData => {
  const fetchedCredentialKeys = credentials.map(credential => credential.credentialKey);

  const missingCredentialKeys = requestedCredentialKeys.filter(
    key => !fetchedCredentialKeys.includes(key)
  );

  const missingCredentialLabels = missingCredentialKeys.map(key => getVDXFKeyLabel(key));

  return {
    signerFqn,
    requestedCredentialKeys,
    fetchedCredentialKeys,
    missingCredentialKeys,
    missingCredentialLabels,
    credentials,
  };
};

export const extractCredentialsReviewDataV1 = (
  request: LoginConsentRequest,
  signedBy: Identity,
  credentials: Credential[]
): CredentialsReviewData => {
  const signerFqn = convertFqnToDisplayFormat(signedBy.fullyqualifiedname);

  const requestedCredentialKeys = request.challenge.requested_access
    .filter(item => SUPPORTED_CREDENTIALS.includes(item.vdxfkey))
    .map(item => item.vdxfkey);

  return processCredentialsReviewData(signerFqn, requestedCredentialKeys, credentials);
};

export const extractCredentialsReviewDataV2 = (
  request: GenericRequest,
  signedBy: Identity,
  credentials: Credential[],
  currentDetailIndex: number,
  appOrDelegatedId?: Identity | null
): CredentialsReviewData => {
  let signerFqn: string;

  if (request.hasAppOrDelegatedID() && appOrDelegatedId) {
    signerFqn = convertFqnToDisplayFormat(appOrDelegatedId.fullyqualifiedname);
  } else {
    signerFqn = convertFqnToDisplayFormat(signedBy.fullyqualifiedname);
  }

  const ordinalWrapper = request.details[currentDetailIndex];

  if (!(ordinalWrapper instanceof UserDataRequestOrdinalVDXFObject)) {
    throw new Error('Detail is not an UserDataRequestOrdinalVDXFObject');
  }

  const userDataDetail = ordinalWrapper.data;

  const requestedCredentialKeys: string[] = userDataDetail.searchDataKey.flatMap(obj =>
    Object.keys(obj)
  );

  return processCredentialsReviewData(signerFqn, requestedCredentialKeys, credentials);
};
