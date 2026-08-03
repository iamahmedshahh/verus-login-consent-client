import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import {
  GenericRequest,
  IdentityUpdateRequestDetails,
  IdentityUpdateRequestOrdinalVDXFObject,
} from 'verus-typescript-primitives';

import PageLayout from '#/components/PageLayout';
import {SnackbarAlert} from '#/components/SnackbarAlert';
import {useAppDispatch} from '#/redux/hooks';
import {setError} from '#/redux/reducers/error/error.actions';
import {
  navigateBackGenericRequest,
  navigateGenericRequest,
} from '#/redux/reducers/navigation/navigationSlice';
import {RootState} from '#/redux/store';
import {getIdentity} from '#/rpc/calls/getIdentity';
import {Identity} from '#/types/identity';
import {convertFqnToDisplayFormat} from '#/utils/fullyqualifiedname';
import {createIdentityDescriptor} from '#/utils/identity';

interface IdentityFieldChange {
  field: string;
  newValue: string;
  oldValue: string;
}

const processIdentityChanges = async (
  details: IdentityUpdateRequestDetails,
  identity: Identity,
  chainId: string
): Promise<IdentityFieldChange[]> => {
  const changes: IdentityFieldChange[] = [];

  if (!identity.identity) {
    return changes;
  }

  const identityChanges = details.identity;
  const currentIdentity = identity.identity;

  if (!identityChanges) {
    return changes;
  }

  if (identityChanges.primaryAddresses?.length > 0) {
    const newPrimaryAddresses = identityChanges.primaryAddresses
      .map(addr => addr.toAddress())
      .sort()
      .join('\n');
    const oldPrimaryAddresses = currentIdentity.primaryaddresses
      ? currentIdentity.primaryaddresses.slice().sort().join('\n')
      : '';

    if (newPrimaryAddresses !== oldPrimaryAddresses) {
      changes.push({
        field: 'Primary Addresses',
        newValue: newPrimaryAddresses,
        oldValue: oldPrimaryAddresses,
      });
    }
  }

  if (identityChanges.minSigs) {
    const newMinSigs = identityChanges.minSigs.toString();
    const oldMinSigs = currentIdentity.minimumsignatures
      ? currentIdentity.minimumsignatures.toString()
      : '';

    if (newMinSigs !== oldMinSigs) {
      changes.push({
        field: 'Minimum Signatures',
        newValue: newMinSigs,
        oldValue: oldMinSigs,
      });
    }
  }

  if (identityChanges.revocationAuthority) {
    if (identityChanges.revocationAuthority.toAddress() !== currentIdentity.revocationauthority) {
      let newRevocationAuthorityDisplay = identityChanges.revocationAuthority.toAddress();
      try {
        const newRevocationIdentity = await getIdentity(
          chainId,
          identityChanges.revocationAuthority.toAddress()
        );
        if (newRevocationIdentity?.identity?.name) {
          const fqn = newRevocationIdentity.fullyqualifiedname
            ? convertFqnToDisplayFormat(newRevocationIdentity.fullyqualifiedname)
            : '';
          newRevocationAuthorityDisplay = createIdentityDescriptor(newRevocationIdentity, fqn);
        }
      } catch (error) {
        console.warn('Could not get the name of the new revocation identity:', error);
      }

      let oldRevocationAuthorityDisplay = currentIdentity.revocationauthority || '';
      if (currentIdentity.revocationauthority) {
        try {
          const oldRevocationIdentity = await getIdentity(
            chainId,
            currentIdentity.revocationauthority
          );
          if (oldRevocationIdentity?.identity?.name) {
            const fqn = oldRevocationIdentity.fullyqualifiedname
              ? convertFqnToDisplayFormat(oldRevocationIdentity.fullyqualifiedname)
              : '';
            oldRevocationAuthorityDisplay = createIdentityDescriptor(oldRevocationIdentity, fqn);
          }
        } catch (error) {
          console.warn('Could not get the name of the old revocation identity:', error);
        }
      }

      changes.push({
        field: 'Revocation Authority',
        newValue: newRevocationAuthorityDisplay,
        oldValue: oldRevocationAuthorityDisplay,
      });
    }
  }

  if (identityChanges.recoveryAuthority) {
    if (identityChanges.recoveryAuthority.toAddress() !== currentIdentity.recoveryauthority) {
      let newRecoveryAuthorityDisplay = identityChanges.recoveryAuthority.toAddress();
      try {
        const newRecoveryIdentity = await getIdentity(
          chainId,
          identityChanges.recoveryAuthority.toAddress()
        );
        if (newRecoveryIdentity?.identity?.name) {
          const fqn = newRecoveryIdentity.fullyqualifiedname
            ? convertFqnToDisplayFormat(newRecoveryIdentity.fullyqualifiedname)
            : '';
          newRecoveryAuthorityDisplay = createIdentityDescriptor(newRecoveryIdentity, fqn);
        }
      } catch (error) {
        console.warn('Could not get the name of the new recovery identity:', error);
      }

      let oldRecoveryAuthorityDisplay = currentIdentity.recoveryauthority || '';
      if (currentIdentity.recoveryauthority) {
        try {
          const oldRecoveryIdentity = await getIdentity(chainId, currentIdentity.recoveryauthority);
          if (oldRecoveryIdentity?.identity?.name) {
            const fqn = oldRecoveryIdentity.fullyqualifiedname
              ? convertFqnToDisplayFormat(oldRecoveryIdentity.fullyqualifiedname)
              : '';
            oldRecoveryAuthorityDisplay = createIdentityDescriptor(oldRecoveryIdentity, fqn);
          }
        } catch (error) {
          console.warn('Could not get the name of the old recovery identity:', error);
        }
      }

      changes.push({
        field: 'Recovery Authority',
        newValue: newRecoveryAuthorityDisplay,
        oldValue: oldRecoveryAuthorityDisplay,
      });
    }
  }

  if (identityChanges.privateAddresses?.length > 0) {
    const newPrivateAddresses = identityChanges.privateAddresses
      .map(addr => addr.toAddressString())
      .join('\n');
    // @ts-expect-error The IdentityDefintion doesn't exactly match the expected result from the daemon but it is close enough
    const oldPrivateAddresses = currentIdentity.privateaddress || '';

    if (newPrivateAddresses !== oldPrivateAddresses) {
      changes.push({
        field: 'Private Addresses',
        newValue: newPrivateAddresses,
        oldValue: oldPrivateAddresses,
      });
    }
  }

  if (identityChanges.unlockAfter != null) {
    const newTimelock = identityChanges.unlockAfter.toString();
    const oldTimelock = currentIdentity.timelock != null ? currentIdentity.timelock.toString() : '';

    if (newTimelock !== oldTimelock) {
      changes.push({
        field: 'Timelock',
        newValue: newTimelock,
        oldValue: oldTimelock,
      });
    }
  }

  return changes;
};

const IdentityUpdateCore: React.FC = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [changes, setChanges] = useState<IdentityFieldChange[]>([]);
  const [openDropdowns, setOpenDropdowns] = useState<{[key: number]: boolean}>({});
  const [fetchError, setFetchError] = useState({
    showError: false,
    description: '',
  });

  const deeplinkData = useSelector((state: RootState) => state.deeplink.data);
  const currentDetailIndex = useSelector((state: RootState) => state.navigation.currentDetailIndex);
  const identities = useSelector((state: RootState) => state.identity.identities) as Identity[];
  const chainId = useSelector((state: RootState) => state.chainMetadata.chainId);

  const isValidDeeplink = deeplinkData instanceof GenericRequest;
  const ordinal = isValidDeeplink ? deeplinkData.details[currentDetailIndex] : null;
  const isValidOrdinal = ordinal instanceof IdentityUpdateRequestOrdinalVDXFObject;

  useEffect(() => {
    if (!isValidDeeplink) {
      dispatch(
        setError(new Error('Unable to handle identity updates outside of generic requests.'))
      );
    } else if (!isValidOrdinal) {
      dispatch(setError(new Error('Unable to handle non-identity update detail.')));
    }
  }, [isValidDeeplink, isValidOrdinal, dispatch]);

  if (!isValidDeeplink || !isValidOrdinal) {
    return null;
  }

  const details = ordinal.data;

  const identityToUpdate = identities.find(id => {
    return id.identity.name === details.identity.name;
  });
  const name = identityToUpdate?.identity.name;

  const handleDropdownToggle = (index: number) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    const computeChanges = async () => {
      if (!deeplinkData) {
        setChanges([]);
        return;
      }

      setLoading(true);
      try {
        const currentChanges = await processIdentityChanges(details, identityToUpdate, chainId);
        setChanges(currentChanges);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load identity';
        setFetchError({
          showError: true,
          description: errorMessage,
        });
        setChanges([]);
      } finally {
        setLoading(false);
      }
    };

    computeChanges();
  }, [details, identityToUpdate]);

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
      title={`Review changes to ${name + '@'}`}
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
            color="success"
            onClick={() => handleNext()}
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
          marginTop: 1,
          marginBottom: 1,
          width: '100%',
          maxHeight: '100%',
          minHeight: 0,
          overflowY: 'auto',
          scrollbarGutter: 'stable',
        }}
      >
        {changes.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No fields to update
            </Typography>
          </Box>
        ) : (
          <List disablePadding sx={{'& > *:last-child': {borderBottom: 'none'}}}>
            {changes.map((change, index) => (
              <React.Fragment key={index}>
                <ListItem dense sx={{pb: 0}}>
                  <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {change.field}
                    </Typography>
                  </Box>
                </ListItem>

                <ListItemButton
                  divider={index < changes.length - 1}
                  dense
                  onClick={() => handleDropdownToggle(index)}
                >
                  <ListItemText
                    primary="New value"
                    secondary={change.newValue}
                    slotProps={{
                      primary: {variant: 'body2', color: 'text.secondary'},
                      secondary: {
                        variant: 'body1',
                        color: 'text.primary',
                        sx: {
                          wordBreak: 'break-all',
                          userSelect: 'text',
                          cursor: 'text',
                          whiteSpace: 'pre-line',
                        },
                        // Allows the user to select the text without opening the dropdown.
                        onMouseDown: e => e.stopPropagation(),
                        onMouseUp: e => e.stopPropagation(),
                        onClick: e => e.stopPropagation(),
                      },
                    }}
                  />
                  {openDropdowns[index] ? (
                    <ExpandLess color="action" />
                  ) : (
                    <ExpandMore color="action" />
                  )}
                </ListItemButton>

                <Collapse in={openDropdowns[index]} timeout="auto" unmountOnExit>
                  <List component="div" dense disablePadding>
                    <ListItem dense sx={{pr: 2}}>
                      <ListItemText
                        primary="Previous value"
                        secondary={change.oldValue}
                        slotProps={{
                          primary: {variant: 'body2', color: 'text.secondary'},
                          secondary: {
                            variant: 'body1',
                            color: 'text.primary',
                            sx: {
                              wordBreak: 'break-all',
                              whiteSpace: 'pre-line',
                            },
                          },
                        }}
                      />
                    </ListItem>
                  </List>
                </Collapse>
              </React.Fragment>
            ))}
          </List>
        )}
      </Card>
      <SnackbarAlert
        open={fetchError.showError}
        text={fetchError.description}
        handleClose={() => setFetchError({showError: false, description: ''})}
      />
    </PageLayout>
  );
};

export default IdentityUpdateCore;
