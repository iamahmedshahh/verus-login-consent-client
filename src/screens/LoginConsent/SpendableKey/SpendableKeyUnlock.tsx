import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {GenericRequest} from 'verus-typescript-primitives';

import PageLayout from '#/components/PageLayout';
import {extractSpendableKeyData} from '#/features/login/spendableKeyDataExtractors';
import {useAppDispatch} from '#/redux/hooks';
import {setError} from '#/redux/reducers/error/error.actions';
import {RootState} from '#/redux/store';
import {unlockSpendableKey} from '#/rpc/calls/unlockSpendableKey';

interface SpendableKeyUnlockProps {
  completeLoginConsent: () => Promise<void>;
}

const SpendableKeyUnlock: React.FC<SpendableKeyUnlockProps> = props => {
  const {completeLoginConsent} = props;
  const dispatch = useAppDispatch();
  const deeplinkData = useSelector((state: RootState) => state.deeplink.data) as GenericRequest;
  const currentDetailIndex = useSelector((state: RootState) => state.navigation.currentDetailIndex);
  const chainId = useSelector((state: RootState) => state.chainMetadata.chainId);
  const chainName = useSelector((state: RootState) => state.chainMetadata.chainName);

  const {requiresPassword} = extractSpendableKeyData(deeplinkData, currentDetailIndex);

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [address, setAddress] = useState<string | null>(null);

  const unlock = async (): Promise<void> => {
    setLoading(true);
    setPasswordError('');

    try {
      const unlocked = await unlockSpendableKey(
        chainId,
        deeplinkData,
        currentDetailIndex,
        password
      );
      setAddress(unlocked.address);
    } catch (e: unknown) {
      if (requiresPassword) {
        setPasswordError(e instanceof Error ? e.message : String(e));
      } else {
        dispatch(setError(e));
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!requiresPassword) unlock();
  }, []);

  const close = async (): Promise<void> => {
    setLoading(true);
    await completeLoginConsent();
  };

  const locked = address == null;

  return (
    <PageLayout
      title={locked && requiresPassword ? 'Decrypt Spendable Key' : 'Claim Gift Card'}
      loading={loading}
      contentStyle={{
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 0.5,
      }}
      footerContent={
        <>
          <Button
            variant="text"
            disabled={loading}
            color="secondary"
            onClick={close}
            sx={{width: 120, mr: 4, p: 1}}
          >
            {locked ? 'Cancel' : 'Close'}
          </Button>
          {locked && requiresPassword && (
            <Button
              variant="contained"
              color="primary"
              disabled={loading || password === ''}
              onClick={unlock}
              sx={{width: 120, p: 1}}
            >
              Decrypt
            </Button>
          )}
        </>
      }
    >
      <Box sx={{maxWidth: 560, width: '100%'}}>
        {locked && requiresPassword && (
          <>
            <Typography sx={{mb: 2}}>
              This spendable key is encrypted and needs to be decrypted before you can redeem its
              funds or VerusIDs.
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              type="password"
              label="Claim password"
              value={password}
              error={passwordError !== ''}
              helperText={passwordError}
              disabled={loading}
              onChange={event => setPassword(event.target.value)}
            />
          </>
        )}
        {!locked && (
          <Card square sx={{width: '100%'}}>
            <List>
              <ListItem>
                <ListItemText
                  primary="Network"
                  disableTypography
                  sx={{fontWeight: 'bold', pr: 4}}
                />
                <ListItemText primary={chainName} disableTypography sx={{textAlign: 'right'}} />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Spendable key address"
                  disableTypography
                  sx={{fontWeight: 'bold', pr: 4}}
                />
                <ListItemText
                  primary={address}
                  disableTypography
                  sx={{textAlign: 'right', wordBreak: 'break-all'}}
                />
              </ListItem>
            </List>
          </Card>
        )}
      </Box>
    </PageLayout>
  );
};

export default SpendableKeyUnlock;
