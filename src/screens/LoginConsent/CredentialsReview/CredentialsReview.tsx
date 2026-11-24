import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import {
  Credential,
  GenericRequest,
  IDENTITY_CREDENTIAL_PLAINLOGIN,
  LoginConsentRequest,
  VerusPayInvoice,
} from 'verus-typescript-primitives';

import {PlainLoginCredential, UnknownCredential} from '#/components/Credential';
import PageLayout from '#/components/PageLayout';
import {isLastDetail} from '#/features/details/detailNavigation';
import {
  extractCredentialsReviewDataV1,
  extractCredentialsReviewDataV2,
  selectUserDataCredentials,
} from '#/features/login/credentialsReviewDataExtractors';
import {createAndSignLoginResponse} from '#/features/login/loginResponse';
import {useAppDispatch} from '#/redux/hooks';
import {setError} from '#/redux/reducers/error/error.actions';
import {
  navigateBackGenericRequest,
  navigateGenericRequest,
  setNavigationPath,
} from '#/redux/reducers/navigation/navigationSlice';
import {RootState} from '#/redux/store';
import {REDIRECT, SELECT_LOGIN_ID} from '#/utils/constants';

interface CredentialsReviewProps {
  setRequestResult: (response: unknown, callback: () => void) => void;
}

const CredentialsReview: React.FC<CredentialsReviewProps> = ({setRequestResult}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [agreedCredentials, setAgreedCredentials] = useState<Record<number, boolean>>({});

  const deeplinkData = useSelector((state: RootState) => state.deeplink.data);
  const chainId = useSelector((state: RootState) => state.chainMetadata.chainId);
  const activeIdentity = useSelector((state: RootState) => state.identity.activeIdentity);
  const currentDetailIndex = useSelector(
    (state: RootState) => state.navigation.currentDetailIndex || 0
  );
  const appOrDelegatedIdentity = useSelector(
    (state: RootState) => state.genericRequest.appOrDelegatedId.identity
  );
  const signedBy = useSelector((state: RootState) => state.signatureInfo.signedBy);
  const rawV1Credentials = useSelector((state: RootState) => state.credentials?.credentials);
  const v1Credentials: Credential[] = rawV1Credentials ? (rawV1Credentials as Credential[]) : [];
  const v2Credentials = useSelector((state: RootState) =>
    selectUserDataCredentials(state, currentDetailIndex)
  );

  const isVerusPayInvoice = deeplinkData instanceof VerusPayInvoice;

  useEffect(() => {
    if (isVerusPayInvoice) {
      dispatch(setError(new Error('Unable to handle a VerusPayInvoice for Credential Review')));
    }
  }, [isVerusPayInvoice, dispatch]);

  if (isVerusPayInvoice) {
    return null;
  }

  const isGenericRequest = deeplinkData instanceof GenericRequest;

  const {
    signerFqn,
    requestedCredentialKeys,
    missingCredentialKeys,
    missingCredentialLabels,
    credentials,
  } = isGenericRequest
    ? extractCredentialsReviewDataV2(
        deeplinkData,
        signedBy!,
        v2Credentials,
        currentDetailIndex,
        appOrDelegatedIdentity
      )
    : extractCredentialsReviewDataV1(deeplinkData, signedBy!, v1Credentials);

  // Like Verus Mobile, each credential has to be agreed to before it is sent.
  const hasAgreedToAllCredentials = credentials.every((_, index) => agreedCredentials[index]);

  const cancel = () => {
    if (isGenericRequest) {
      dispatch(navigateBackGenericRequest());
    } else {
      dispatch(setNavigationPath(SELECT_LOGIN_ID));
    }
  };

  const isLastDetailInRequest =
    isGenericRequest && isLastDetail(deeplinkData as GenericRequest, currentDetailIndex);
  const continueButtonText = isLastDetailInRequest ? 'Finish' : 'Continue';
  const continueButtonColor = isLastDetailInRequest ? 'primary' : 'success';

  const continueLogin = async () => {
    if (isGenericRequest) {
      dispatch(navigateGenericRequest());
    } else {
      setLoading(true);
      const loginIdentity = activeIdentity.identity.identityaddress;
      const signedResponse = await createAndSignLoginResponse(
        chainId,
        deeplinkData as LoginConsentRequest,
        loginIdentity,
        credentials
      );

      setRequestResult(signedResponse, () => {
        dispatch(setNavigationPath(REDIRECT));
      });
    }
  };

  const renderCredentialComponent = (credential: Credential, index: number): React.JSX.Element => {
    const credentialId = `credential-${index}`;
    const credentialKey = credential.credentialKey;

    switch (credentialKey) {
      case IDENTITY_CREDENTIAL_PLAINLOGIN.vdxfid:
        return <PlainLoginCredential key={credentialId} credential={credential} />;
      default:
        return <UnknownCredential key={credentialId} credential={credential} />;
    }
  };

  return (
    <PageLayout
      title={'Review credentials to be sent to ' + signerFqn}
      loading={loading}
      footerContent={
        <>
          <Button
            variant="text"
            disabled={loading}
            color="secondary"
            onClick={() => cancel()}
            style={{
              width: 120,
              marginRight: 32,
              padding: 8,
            }}
          >
            {'Back'}
          </Button>
          <Button
            variant="contained"
            color={continueButtonColor}
            disabled={loading || !hasAgreedToAllCredentials}
            onClick={() => continueLogin()}
            style={{
              width: 120,
              padding: 8,
            }}
          >
            {continueButtonText}
          </Button>
        </>
      }
    >
      {credentials.length > 0 && (
        <Alert severity="warning" sx={{width: '100%', textAlign: 'left'}}>
          {`The credentials below will be ${isGenericRequest ? 'encrypted and ' : ''}sent to ${signerFqn}. Only continue if every credential is expected.`}
        </Alert>
      )}

      <Card
        square
        sx={{
          marginTop: 1,
          marginBottom: 1,
          width: '100%',
          maxHeight: '100%',
          minHeight: 0,
          overflowY: 'auto',
          scrollbarGutter: 'stable',
        }}
      >
        <List disablePadding sx={{'& > *:last-child': {borderBottom: 'none'}}}>
          {credentials.length > 0 && (
            <>
              <List component="div">
                {credentials.map((credential, index) => (
                  <React.Fragment key={index}>
                    {renderCredentialComponent(credential, index)}
                    <ListItem divider dense sx={{pl: 4}}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={!!agreedCredentials[index]}
                            onChange={e =>
                              setAgreedCredentials(current => ({
                                ...current,
                                [index]: e.target.checked,
                              }))
                            }
                            color="primary"
                          />
                        }
                        label={`I agree to send credential ${index + 1}`}
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </>
          )}

          {requestedCredentialKeys.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No credentials requested by the application."
                disableTypography
              />
            </ListItem>
          )}

          {requestedCredentialKeys.length > 0 && credentials.length === 0 && (
            <ListItem>
              <ListItemText primary="No credentials available to include." disableTypography />
            </ListItem>
          )}
        </List>
      </Card>

      {missingCredentialKeys.length > 0 && (
        <Alert severity="warning" sx={{mt: 2, width: '90%', textAlign: 'left'}}>
          <AlertTitle>The following requested credentials were not found:</AlertTitle>
          {missingCredentialLabels.join(', ')}
        </Alert>
      )}
    </PageLayout>
  );
};

export default CredentialsReview;
