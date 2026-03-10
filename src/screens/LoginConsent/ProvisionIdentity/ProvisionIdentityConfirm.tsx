import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import axios from 'axios';
import {
  fromBase58Check,
  LOGIN_CONSENT_ID_PROVISIONING_WEBHOOK_VDXF_KEY,
  LOGIN_CONSENT_PROVISIONING_RESULT_STATE_COMPLETE,
  LOGIN_CONSENT_PROVISIONING_RESULT_STATE_FAILED,
  LOGIN_CONSENT_PROVISIONING_RESULT_STATE_PENDINGAPPROVAL,
  LoginConsentProvisioningChallenge,
  LoginConsentProvisioningDecision,
  LoginConsentProvisioningRequest,
  LoginConsentProvisioningResponse,
  LoginConsentProvisioningResponseInterface,
  LoginConsentRequest,
} from 'verus-typescript-primitives';

import PageLayout from '#/components/PageLayout';
import {SnackbarAlert} from '#/components/SnackbarAlert';
import {useAppDispatch} from '#/redux/hooks';
import {setNavigationPath} from '#/redux/reducers/navigation/navigationSlice';
import {
  setProvisioningName,
  setProvisioningResponse,
  setRequestedFqn,
  setRequestedId,
} from '#/redux/reducers/provision/provision.actions';
import {RootState} from '#/redux/store';
import {getIdentity} from '#/rpc/calls/getIdentity';
import {getVdxfId} from '#/rpc/calls/getVdxfId';
import {signIdProvisioningRequest} from '#/rpc/calls/signIdProvisioningRequest';
import {verifyIdProvisioningResponse} from '#/rpc/calls/verifyIdProvisioningResponse';
import {PROVISIONING_FORM, PROVISIONING_RESULT} from '#/utils/constants';

interface ProvisioningInfoItem {
  vdxfkey: string;
  data: string;
}

interface ProvisioningInfo {
  provAddress: ProvisioningInfoItem | null;
  provSystemId: ProvisioningInfoItem | null;
  provFqn: ProvisioningInfoItem | null;
  provParent: ProvisioningInfoItem | null;
  friendlyNameMap: Record<string, string>;
}

interface SubmissionError {
  showError: boolean;
  description: string;
}

const handleProvisioningResponse = async (
  response: LoginConsentProvisioningResponseInterface,
  requestedId: string,
  requestedFqn: string
): Promise<void> => {
  const res = new LoginConsentProvisioningResponse(response);

  const verificationCheck = await verifyIdProvisioningResponse(res);
  const verified = verificationCheck.verified;

  if (!verified) throw new Error('Failed to verify response from the provisioning service.');

  const decision = res.decision as LoginConsentProvisioningDecision;
  const result = decision.result;

  if (!result) throw new Error('Provisioning response did not contain a result.');

  const {error_desc, state} = result;

  if (state === LOGIN_CONSENT_PROVISIONING_RESULT_STATE_FAILED.vdxfid) {
    throw new Error(error_desc);
  } else if (
    state === LOGIN_CONSENT_PROVISIONING_RESULT_STATE_PENDINGAPPROVAL.vdxfid ||
    state === LOGIN_CONSENT_PROVISIONING_RESULT_STATE_COMPLETE.vdxfid
  ) {
    if (!result.identity_address && !result.fully_qualified_name) {
      throw new Error('Provisioning response did not contain an identity or fully qualified name.');
    }

    if (result.identity_address && result.identity_address !== requestedId) {
      throw new Error(
        `Provisioning response identity [${result.identity_address}] address does not match requested identity address [${requestedId}].`
      );
    }

    if (
      result.fully_qualified_name &&
      result.fully_qualified_name.toLowerCase() !== requestedFqn.toLowerCase()
    ) {
      throw new Error(
        `Provisioning response fully qualified name [${result.fully_qualified_name.toLowerCase()}] does not match requested fully qualified name [${requestedFqn.toLowerCase()}].`
      );
    }
  }
};

const ProvisionIdentityConfirm: React.FC = () => {
  const dispatch = useAppDispatch();
  const deeplinkData = useSelector((state: RootState) => state.deeplink.data);
  const chainId = useSelector((state: RootState) => state.chainMetadata.chainId);
  const provisioningInfo = useSelector(
    (state: RootState) => state.provision.provisioningInfo
  ) as ProvisioningInfo;
  const identityToProvisionField = useSelector(
    (state: RootState) => state.provision.identityToProvisionField
  );
  const primaryAddress = useSelector((state: RootState) => state.provision.primaryAddress);

  const {provAddress, provSystemId, provFqn, provParent, friendlyNameMap} = provisioningInfo;

  let displayIdentity: string;
  if (provFqn) {
    displayIdentity = provFqn.data;
  } else if (friendlyNameMap[identityToProvisionField]) {
    displayIdentity = `${friendlyNameMap[identityToProvisionField]}@`;
  } else {
    displayIdentity = identityToProvisionField;
  }

  let displayParent: string | null = null;
  if (provParent != null) {
    displayParent = friendlyNameMap[provParent.data] ?? provParent.data;
  }

  let displaySystemid: string | null = null;
  if (provSystemId != null) {
    displaySystemid = friendlyNameMap[provSystemId.data] ?? provSystemId.data;
  }

  const [loading, setLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState<SubmissionError>({
    showError: false,
    description: '',
  });

  const cancel = (): void => {
    dispatch(setNavigationPath(PROVISIONING_FORM));
  };

  const submitData = async (): Promise<void> => {
    setLoading(true);

    const onSuccess = (
      response: unknown,
      requestedFqn: string,
      provName: string,
      requestedId: string
    ) => {
      setLoading(false);
      dispatch(setProvisioningResponse(response));
      dispatch(setRequestedFqn(requestedFqn));
      dispatch(setProvisioningName(provName));
      dispatch(setRequestedId(requestedId));
      dispatch(setNavigationPath(PROVISIONING_RESULT));
    };

    const onError = (msg: string) => {
      setSubmissionError({showError: true, description: msg});
      setLoading(false);
    };

    try {
      const loginRequest = new LoginConsentRequest(deeplinkData as LoginConsentRequest);

      const webhookSubject = loginRequest.challenge.provisioning_info
        ? loginRequest.challenge.provisioning_info.find(
            (x: {vdxfkey: string}) =>
              x.vdxfkey === LOGIN_CONSENT_ID_PROVISIONING_WEBHOOK_VDXF_KEY.vdxfid
          )
        : null;

      if (webhookSubject == null) throw new Error('No endpoint for ID provisioning');

      const webhookUrl = webhookSubject.data;
      const identity = identityToProvisionField ? identityToProvisionField.trim() : '';

      let identityName: string;
      let isIAddress: boolean;
      let parent: string | null;
      let systemid: string | null;
      let nameId: string;
      let requestedFqn: string;

      try {
        fromBase58Check(identity);
        isIAddress = true;
      } catch {
        isIAddress = false;
      }

      if (isIAddress) {
        const identityObj = await getIdentity(chainId, identity);
        identityName = identityObj.identity.name;
        parent = identityObj.identity.parent;
        systemid = identityObj.identity.systemid;
        nameId = identity;
        requestedFqn = identityObj.fullyqualifiedname;
      } else {
        identityName = identity.split('@')[0];
        parent = provParent ? provParent.data : null;
        systemid = provSystemId ? provSystemId.data : null;
        const parentObj = await getIdentity(chainId, parent ? parent : loginRequest.system_id);
        requestedFqn = `${identityName.split('.')[0]}.${parentObj.fullyqualifiedname}`;
        nameId = (await getVdxfId(chainId, requestedFqn)).vdxfid;
      }

      const provisionRequest = new LoginConsentProvisioningRequest({
        signing_address: primaryAddress,
        challenge: new LoginConsentProvisioningChallenge({
          challenge_id: loginRequest.challenge.challenge_id,
          created_at: Number((Date.now() / 1000).toFixed(0)),
          name: identityName,
          system_id: systemid ?? undefined,
          parent: parent ?? undefined,
        }),
      });

      const signedRequest = await signIdProvisioningRequest(
        chainId,
        provisionRequest,
        primaryAddress
      );

      const res = await axios.post(webhookUrl, signedRequest);
      const provisionResponse = res.data;
      await handleProvisioningResponse(provisionResponse, nameId, requestedFqn);

      const provName = (await getIdentity(chainId, loginRequest.signing_id)).identity.name;
      onSuccess(res.data, requestedFqn, provName, nameId);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      onError(message);
    }
  };

  return (
    <PageLayout
      title="Review the Provisioning Request"
      loading={loading}
      contentStyle={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      footerContent={
        <>
          <Button
            variant="text"
            disabled={loading}
            color="secondary"
            onClick={cancel}
            sx={{width: 120, mr: 4, p: 1}}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="success"
            disabled={loading}
            onClick={submitData}
            sx={{width: 120, p: 1}}
          >
            Request
          </Button>
        </>
      }
    >
      <Card
        square
        sx={{
          mt: 1,
          mb: 1,
          width: '100%',
          overflowY: 'auto',
          maxHeight: '54vh',
        }}
      >
        <List>
          <ListItem>
            <ListItemText primary="Identity" disableTypography sx={{fontWeight: 'bold', pr: 4}} />
            <ListItemText primary={displayIdentity} disableTypography sx={{textAlign: 'right'}} />
          </ListItem>
          {provAddress && (
            <Box>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Identity address"
                  disableTypography
                  sx={{fontWeight: 'bold', pr: 4}}
                />
                <ListItemText
                  primary={provAddress.data}
                  disableTypography
                  sx={{textAlign: 'right'}}
                />
              </ListItem>
            </Box>
          )}
          <Divider />
          <ListItem>
            <ListItemText
              primary="Primary address (once received)"
              disableTypography
              sx={{fontWeight: 'bold', pr: 4}}
            />
            <ListItemText primary={primaryAddress} disableTypography sx={{textAlign: 'right'}} />
          </ListItem>
          {displayParent && (
            <Box>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Identity parent"
                  disableTypography
                  sx={{fontWeight: 'bold', pr: 4}}
                />
                <ListItemText primary={displayParent} disableTypography sx={{textAlign: 'right'}} />
              </ListItem>
            </Box>
          )}
          {provFqn && (
            <Box>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Full identity name"
                  disableTypography
                  sx={{fontWeight: 'bold', pr: 4}}
                />
                <ListItemText primary={provFqn.data} disableTypography sx={{textAlign: 'right'}} />
              </ListItem>
            </Box>
          )}
          {displaySystemid && (
            <Box>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Identity system ID"
                  disableTypography
                  sx={{fontWeight: 'bold', pr: 4}}
                />
                <ListItemText
                  primary={displaySystemid}
                  disableTypography
                  sx={{textAlign: 'right'}}
                />
              </ListItem>
            </Box>
          )}
        </List>
      </Card>
      <SnackbarAlert
        open={submissionError.showError}
        text={submissionError.description}
        handleClose={() => setSubmissionError({showError: false, description: ''})}
      />
    </PageLayout>
  );
};

export default ProvisionIdentityConfirm;
