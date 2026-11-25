import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import {
  AuthenticationRequestOrdinalVDXFObject,
  GenericRequest,
  IdentityUpdateRequestOrdinalVDXFObject,
  LoginConsentRequest,
} from 'verus-typescript-primitives';

import CollapsibleListSection from '#/components/CollapsibleListSection';
import IdentityDetails from '#/components/Identity';
import {LIST_ITEM_SLOTS} from '#/components/listItemSlots';
import NestedListItem from '#/components/NestedListItem';
import PageLayout from '#/components/PageLayout';
import {extractConsentDataV1, extractConsentDataV2} from '#/features/login/consentDataExtractors';
import {useAppDispatch} from '#/redux/hooks';
import {setError} from '#/redux/reducers/error/error.actions';
import {selectDetailById} from '#/redux/reducers/genericRequest/authenticationSlice';
import {
  checkAndUpdateIdentities,
  setActiveVerusId,
} from '#/redux/reducers/identity/identity.actions';
import {
  navigateGenericRequest,
  setExternalAction,
  setNavigationPath,
} from '#/redux/reducers/navigation/navigationSlice';
import {RootState} from '#/redux/store';
import {Identity} from '#/types/identity';
import {EXTERNAL_ACTION, EXTERNAL_CHAIN_START, SELECT_LOGIN_ID} from '#/utils/constants';
import {convertFqnToDisplayFormat} from '#/utils/fullyqualifiedname';
import {unixToDate} from '#/utils/math';

interface ConsentProps {
  canProcessRequest: () => boolean;
  completeLoginConsent: () => Promise<void>;
}

const Consent: React.FC<ConsentProps> = props => {
  const {canProcessRequest, completeLoginConsent} = props;
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const deeplinkData = useSelector((state: RootState) => state.deeplink.data);
  const currentDetailIndex = useSelector((state: RootState) => state.navigation.currentDetailIndex);
  const chainId = useSelector((state: RootState) => state.chainMetadata.chainId);
  const chainName = useSelector((state: RootState) => state.chainMetadata.chainName);
  const signatureInfo = useSelector((state: RootState) => state.signatureInfo);
  const appOrDelegatorIdentity = useSelector(
    (state: RootState) => state.genericRequest.appOrDelegatorId.identity
  );
  const identities = useSelector((state: RootState) => state.identity.identities) as Identity[];
  const activeIdentity = useSelector(
    (state: RootState) => state.identity.activeIdentity
  ) as Identity;

  const firstDetailIndex = 0;
  const preppedAuthDetail = useSelector((state: RootState) =>
    selectDetailById(state, firstDetailIndex)
  );

  const {sigBlockInfo, signedBy, signingRevocationIdentity, signingRecoveryIdentity} =
    signatureInfo;
  const time = sigBlockInfo?.time;

  const isGenericRequest = deeplinkData instanceof GenericRequest;
  const firstDetail = isGenericRequest ? deeplinkData.details[firstDetailIndex] : null;

  // The reply is signed by the identity picked on the sign-in screen, or by the identity being
  // updated when that is the only detail. Other requests pick it here, like "Respond With" in
  // Verus Mobile.
  const needsReplyIdentity =
    isGenericRequest &&
    !(
      firstDetail instanceof AuthenticationRequestOrdinalVDXFObject ||
      firstDetail instanceof IdentityUpdateRequestOrdinalVDXFObject
    );
  const replyIdentityMissing = needsReplyIdentity && activeIdentity == null;

  const signedByMissing = signedBy == null;

  useEffect(() => {
    if (signedByMissing) {
      dispatch(setError(new Error('Missing signer identity for consent screen')));
    }
  }, [signedByMissing, dispatch]);

  if (signedByMissing) {
    return null;
  }

  const consentData = isGenericRequest
    ? extractConsentDataV2(
        deeplinkData,
        signedBy,
        // Since the detail index for showing the general generic request info is -1,
        // we need to clamp this to 0 in order to get the first detail's info like
        // constraints.
        Math.max(0, currentDetailIndex),
        appOrDelegatorIdentity,
        preppedAuthDetail,
        identities
      )
    : extractConsentDataV1(deeplinkData as LoginConsentRequest, signedBy);

  const {title, permissionsLabels, systemId, constraintsLabels, expiryLabel, responseURIsLabels} =
    consentData;
  const systemDescriptor = `${chainName} (${systemId})`;

  const tryLogin = async (): Promise<void> => {
    setLoading(true);

    const userActions = await checkAndUpdateIdentities(chainId);
    userActions.map(action => dispatch(action));

    if (canProcessRequest()) {
      if (isGenericRequest) {
        dispatch(navigateGenericRequest());
      } else {
        dispatch(setNavigationPath(SELECT_LOGIN_ID));
      }
    } else {
      dispatch(setExternalAction(EXTERNAL_CHAIN_START));
      dispatch(setNavigationPath(EXTERNAL_ACTION));
    }
  };

  const cancel = async (): Promise<void> => {
    setLoading(true);
    await completeLoginConsent();
  };

  const selectReplyIdentity = (address: string): void => {
    dispatch(setActiveVerusId(identities.find(id => id.identity.identityaddress === address)));
  };

  return (
    <PageLayout
      title={title}
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
            {'Cancel'}
          </Button>
          <Button
            variant="contained"
            color="success"
            disabled={loading || replyIdentityMissing}
            onClick={() => tryLogin()}
            style={{
              width: 120,
              padding: 8,
            }}
          >
            {'Continue'}
          </Button>
        </div>
      }
    >
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
          <IdentityDetails
            identity={signedBy}
            revocationAuthority={signingRevocationIdentity}
            recoveryAuthority={signingRecoveryIdentity}
            systemDescriptor={systemDescriptor}
            headerLabel="Requested by"
          />

          <ListItem divider>
            <ListItemText
              primary="System name"
              secondary={systemDescriptor || '-'}
              slotProps={LIST_ITEM_SLOTS.standard}
            />
          </ListItem>

          <ListItem divider>
            <ListItemText
              primary="Signed on"
              secondary={time ? unixToDate(time) : '-'}
              slotProps={LIST_ITEM_SLOTS.standard}
            />
          </ListItem>

          {permissionsLabels && permissionsLabels.length > 0 && (
            <CollapsibleListSection title="Permissions Requested" divider collapseHint={false}>
              {permissionsLabels.map((permission, index) => (
                <NestedListItem key={index} primary={`${permission}`} />
              ))}
            </CollapsibleListSection>
          )}

          {constraintsLabels && constraintsLabels.length > 0 && (
            <CollapsibleListSection title="Constraints" divider collapseHint={false}>
              {constraintsLabels.map((constraint, index) => (
                <NestedListItem key={index} primary={`${constraint}`} />
              ))}
            </CollapsibleListSection>
          )}

          {responseURIsLabels.length > 0 && (
            <CollapsibleListSection title="Response URIs" divider collapseHint={false}>
              {responseURIsLabels.map((uri, index) => (
                <NestedListItem key={index} primary={`${uri}`} />
              ))}
            </CollapsibleListSection>
          )}

          {expiryLabel && (
            <ListItem>
              <ListItemText
                primary="Expires at"
                secondary={expiryLabel || '-'}
                slotProps={LIST_ITEM_SLOTS.standard}
              />
            </ListItem>
          )}
        </List>
      </Card>

      {needsReplyIdentity && (
        <FormControl fullWidth size="small">
          <InputLabel id="reply-identity-label">Respond with</InputLabel>
          <Select
            labelId="reply-identity-label"
            label="Respond with"
            value={activeIdentity == null ? '' : activeIdentity.identity.identityaddress}
            disabled={loading}
            sx={{textAlign: 'start'}}
            onChange={e => selectReplyIdentity(e.target.value)}
          >
            {identities.map(id => (
              <MenuItem key={id.identity.identityaddress} value={id.identity.identityaddress}>
                {convertFqnToDisplayFormat(id.fullyqualifiedname)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </PageLayout>
  );
};

export default Consent;
