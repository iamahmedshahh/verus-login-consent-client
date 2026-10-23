import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {GenericRequest} from 'verus-typescript-primitives';

import CollapsibleListSection from '#/components/CollapsibleListSection';
import NestedListItem from '#/components/NestedListItem';
import PageLayout from '#/components/PageLayout';
import {extractSpendableKeyData} from '#/features/login/spendableKeyDataExtractors';
import {useAppDispatch} from '#/redux/hooks';
import {setError} from '#/redux/reducers/error/error.actions';
import {RootState} from '#/redux/store';
import {
  discoverSpendableKeyClaims,
  SpendableKeyClaims,
} from '#/rpc/calls/discoverSpendableKeyClaims';
import {unlockSpendableKey} from '#/rpc/calls/unlockSpendableKey';
import {convertFqnToDisplayFormat} from '#/utils/fullyqualifiedname';

interface SpendableKeyUnlockProps {
  completeLoginConsent: () => Promise<void>;
}

const getClaimTitle = ({currencies, identities}: SpendableKeyClaims): string => {
  if (currencies.length > 0 && identities.length > 0) return 'Claim identity and funds';
  if (identities.length > 0) return 'Claim identity';
  return 'Claim funds';
};

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
  const [claims, setClaims] = useState<SpendableKeyClaims | null>(null);

  const unlock = async (): Promise<void> => {
    setLoading(true);
    setPasswordError('');

    let address: string;

    try {
      ({address} = await unlockSpendableKey(chainId, deeplinkData, currentDetailIndex, password));
    } catch (e: unknown) {
      if (requiresPassword) {
        setPasswordError(e instanceof Error ? e.message : String(e));
      } else {
        dispatch(setError(e));
      }

      setLoading(false);
      return;
    }

    try {
      setClaims(await discoverSpendableKeyClaims(chainId, address));
    } catch (e: unknown) {
      dispatch(setError(e));
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

  const locked = claims == null;
  const hasClaims = !locked && (claims.currencies.length > 0 || claims.identities.length > 0);
  let title = 'Scanning spendable key';
  if (!locked)
  {
    title = getClaimTitle(claims);
  }
  else if (requiresPassword)
  {
    title = 'Decrypt spendable key';
  }
  return (
    <PageLayout
      title={title}
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
            {locked || hasClaims ? 'Cancel' : 'Done'}
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
      <Box
        sx={{maxWidth: 560, width: '100%', display: 'flex', flexDirection: 'column', minHeight: 0}}
      >
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
          <Typography color="text.secondary" sx={{mb: 2, textAlign: 'center'}}>
            {hasClaims
              ? 'Review the transparent funds and VerusIDs found on this key.'
              : 'No transparent funds or VerusIDs were found.'}
          </Typography>
        )}
        {hasClaims && (
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
              {claims.currencies.length > 0 && (
                <CollapsibleListSection title="Balances" subtitle={chainName} initiallyExpanded>
                  {claims.currencies.map(currency => (
                    <NestedListItem
                      key={currency.currencyId}
                      primary={currency.name}
                      secondary={currency.amount}
                      variant="standard"
                    />
                  ))}
                </CollapsibleListSection>
              )}
              {claims.identities.length > 0 && (
                <CollapsibleListSection title="VerusIDs" subtitle={chainName} initiallyExpanded>
                  {claims.identities.map(identity => (
                    <NestedListItem
                      key={identity.identityAddress}
                      primary={identity.unsupportedReason ?? identity.identityAddress}
                      secondary={
                        identity.fullyQualifiedName
                          ? convertFqnToDisplayFormat(identity.fullyQualifiedName)
                          : identity.identityAddress
                      }
                      variant="standard"
                    />
                  ))}
                </CollapsibleListSection>
              )}
            </List>
          </Card>
        )}
      </Box>
    </PageLayout>
  );
};

export default SpendableKeyUnlock;
