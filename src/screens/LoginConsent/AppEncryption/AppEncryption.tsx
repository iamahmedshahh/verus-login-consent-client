import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import {AppEncryptionRequestOrdinalVDXFObject, GenericRequest} from 'verus-typescript-primitives';

import {LIST_ITEM_SLOTS} from '#/components/listItemSlots';
import PageLayout from '#/components/PageLayout';
import {isLastDetail} from '#/features/details/detailNavigation';
import {useAppDispatch} from '#/redux/hooks';
import {setError} from '#/redux/reducers/error/error.actions';
import {
  navigateBackGenericRequest,
  navigateGenericRequest,
} from '#/redux/reducers/navigation/navigationSlice';
import {RootState} from '#/redux/store';
import {Identity} from '#/types/identity';
import {convertFqnToDisplayFormat} from '#/utils/fullyqualifiedname';
import {createIdentityDescriptor} from '#/utils/identity';

const AppEncryption: React.FC = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<boolean>(false);

  const deeplinkData = useSelector((state: RootState) => state.deeplink.data);
  const currentDetailIndex = useSelector((state: RootState) => state.navigation.currentDetailIndex);
  const activeIdentity = useSelector(
    (state: RootState) => state.identity.activeIdentity
  ) as Identity;
  const signedBy = useSelector((state: RootState) => state.signatureInfo.signedBy);
  const appOrDelegatedIdentity = useSelector(
    (state: RootState) => state.genericRequest.appOrDelegatedId.identity
  );

  const isValidDeeplink = deeplinkData instanceof GenericRequest;
  const ordinal = isValidDeeplink ? deeplinkData.details[currentDetailIndex] : null;
  const isValidOrdinal = ordinal instanceof AppEncryptionRequestOrdinalVDXFObject;

  useEffect(() => {
    if (!isValidDeeplink) {
      dispatch(setError(new Error('Unable to handle app encryption outside of generic requests.')));
    } else if (!isValidOrdinal) {
      dispatch(setError(new Error('Unable to handle non-app encryption detail.')));
    }
  }, [isValidDeeplink, isValidOrdinal, dispatch]);

  if (!isValidDeeplink || !isValidOrdinal) {
    return null;
  }

  const appEncryptionDetails = ordinal.data;

  // Like generateAppEncryptionResponse, the keys are for the app the request is on behalf of,
  // otherwise for the signer.
  const appIdentity = appOrDelegatedIdentity ?? signedBy;
  const appName = convertFqnToDisplayFormat(appIdentity.fullyqualifiedname);

  const isLastDetailInRequest = isLastDetail(deeplinkData, currentDetailIndex);
  const continueButtonText = isLastDetailInRequest ? 'Finish' : 'Continue';
  const continueButtonColor = isLastDetailInRequest ? 'primary' : 'success';

  const handleNext = async (): Promise<void> => {
    setLoading(true);
    try {
      dispatch(navigateGenericRequest());
    } finally {
      setLoading(false);
    }
  };

  const cancel = async (): Promise<void> => {
    setLoading(true);
    try {
      dispatch(navigateBackGenericRequest());
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title={`Review the encryption keys requested by ${appName}`}
      loading={loading}
      contentStyle={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
      footerContent={
        <div style={{display: 'flex', justifyContent: 'flex-end', width: '100%'}}>
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
            disabled={loading}
            color={continueButtonColor}
            onClick={() => handleNext()}
            style={{
              width: 120,
              padding: 8,
            }}
          >
            {continueButtonText}
          </Button>
        </div>
      }
    >
      {appEncryptionDetails.returnESK() && (
        <Alert severity="warning" sx={{width: '100%', textAlign: 'left'}}>
          <AlertTitle>Extended Spending Key Requested</AlertTitle>
          This app is requesting the Extended Spending Key for the app-scope channel. It can decrypt
          data, spend funds, and derive every nested channel for your selected identity, app scope,
          and key number. Only approve if you fully trust this application.
        </Alert>
      )}

      <Card
        square
        sx={{
          width: '100%',
          maxHeight: '100%',
          minHeight: 0,
          overflowY: 'auto',
          scrollbarGutter: 'stable',
        }}
      >
        <List disablePadding sx={{'& > *:last-child': {borderBottom: 'none'}}}>
          <ListItem divider>
            <ListItemText
              primary="Identity"
              secondary={createIdentityDescriptor(activeIdentity)}
              slotProps={LIST_ITEM_SLOTS.standard}
            />
          </ListItem>

          <ListItem divider>
            <ListItemText
              primary="App scope"
              secondary={createIdentityDescriptor(appIdentity)}
              slotProps={LIST_ITEM_SLOTS.standard}
            />
          </ListItem>

          <ListItem divider>
            <ListItemText
              primary="Key number"
              secondary={appEncryptionDetails.derivationNumber.toString()}
              slotProps={LIST_ITEM_SLOTS.standard}
            />
          </ListItem>

          {appEncryptionDetails.hasRequestID() && (
            <ListItem divider>
              <ListItemText
                primary="Request ID"
                secondary={appEncryptionDetails.requestID.toIAddress()}
                slotProps={LIST_ITEM_SLOTS.standard}
              />
            </ListItem>
          )}

          <ListItem divider>
            <ListItemText
              primary="Keys encrypted to"
              secondary={appEncryptionDetails.encryptResponseToAddress.toAddressString()}
              slotProps={LIST_ITEM_SLOTS.standard}
            />
          </ListItem>
        </List>
      </Card>
    </PageLayout>
  );
};

export default AppEncryption;
