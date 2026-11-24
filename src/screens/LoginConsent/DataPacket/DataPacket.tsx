import {createHash} from 'crypto';

import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import {
  DataDescriptor,
  DataPacketRequestOrdinalVDXFObject,
  GenericRequest,
} from 'verus-typescript-primitives';

import CollapsibleListSection from '#/components/CollapsibleListSection';
import {LIST_ITEM_SLOTS} from '#/components/listItemSlots';
import NestedListItem from '#/components/NestedListItem';
import PageLayout from '#/components/PageLayout';
import {getSignableObjectBuffer} from '#/features/details/dataPacket';
import {isLastDetail} from '#/features/details/detailNavigation';
import {useAppDispatch} from '#/redux/hooks';
import {setError} from '#/redux/reducers/error/error.actions';
import {
  navigateBackGenericRequest,
  navigateGenericRequest,
} from '#/redux/reducers/navigation/navigationSlice';
import {RootState} from '#/redux/store';
import {Identity} from '#/types/identity';
import {createIdentityDescriptor} from '#/utils/identity';

// The hash of the bytes the identity signs, like Verus Mobile shows.
const getSignedHash = (signableObject: DataDescriptor | string): string =>
  createHash('sha256').update(getSignableObjectBuffer(signableObject)).digest('hex');

const DataPacket: React.FC = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [agreedStatements, setAgreedStatements] = useState<Record<number, boolean>>({});
  const [agreedObjects, setAgreedObjects] = useState<Record<number, boolean>>({});

  const deeplinkData = useSelector((state: RootState) => state.deeplink.data);
  const currentDetailIndex = useSelector((state: RootState) => state.navigation.currentDetailIndex);
  const activeIdentity = useSelector(
    (state: RootState) => state.identity.activeIdentity
  ) as Identity;

  const isValidDeeplink = deeplinkData instanceof GenericRequest;
  const ordinal = isValidDeeplink ? deeplinkData.details[currentDetailIndex] : null;
  const isValidOrdinal = ordinal instanceof DataPacketRequestOrdinalVDXFObject;

  useEffect(() => {
    if (!isValidDeeplink) {
      dispatch(setError(new Error('Unable to handle data packets outside of generic requests.')));
    } else if (!isValidOrdinal) {
      dispatch(setError(new Error('Unable to handle non-data packet ordinal.')));
    }
  }, [isValidDeeplink, isValidOrdinal, dispatch]);

  if (!isValidDeeplink || !isValidOrdinal) {
    return null;
  }

  const dataPacketDetails = ordinal.data;

  // Like Verus Mobile, each statement and data item has to be agreed to before it is signed.
  const hasAgreedToAll =
    (dataPacketDetails.statements ?? []).every((_, index) => agreedStatements[index]) &&
    dataPacketDetails.signableObjects.every((_, index) => agreedObjects[index]);

  const renderObjectAgreement = (index: number): React.ReactNode => (
    <ListItem divider sx={{pl: 6}}>
      <FormControlLabel
        control={
          <Checkbox
            checked={!!agreedObjects[index]}
            onChange={e => setAgreedObjects(current => ({...current, [index]: e.target.checked}))}
            color="primary"
          />
        }
        label={`I reviewed data item ${index + 1} and agree to sign it`}
      />
    </ListItem>
  );

  const getDisplayData = (objectdata: Buffer, mimeType?: string): string => {
    if (mimeType && mimeType.startsWith('text/')) {
      return objectdata.toString('utf-8');
    }
    return objectdata.toString('hex');
  };

  const renderSignableObjects = (): React.ReactNode[] => {
    let messageCount = 0;
    let objectCount = 0;
    return dataPacketDetails.signableObjects.map((object, index) => {
      if (typeof object === 'string') {
        messageCount += 1;
        return (
          <CollapsibleListSection
            key={index}
            title={`Message #${messageCount}`}
            divider
            collapseHint={false}
            initiallyExpanded
          >
            <NestedListItem primary="Data" secondary={object} variant="standard" />
            <NestedListItem
              primary="SHA-256 hash being signed"
              secondary={getSignedHash(object)}
              variant="standard"
            />
            {renderObjectAgreement(index)}
          </CollapsibleListSection>
        );
      }
      objectCount += 1;
      return (
        <CollapsibleListSection
          key={index}
          title={`Object #${objectCount}` + (object.label ? `: ${object.label}` : '')}
          divider
          collapseHint={false}
          initiallyExpanded
        >
          {object.label && (
            <NestedListItem primary="Label" secondary={object.label} variant="standard" />
          )}
          {object.mimeType && (
            <NestedListItem primary="MIME Type" secondary={object.mimeType} variant="standard" />
          )}
          {object.objectdata && (
            <NestedListItem
              primary="Data"
              secondary={getDisplayData(object.objectdata, object.mimeType)}
              variant="standard"
            />
          )}
          <NestedListItem
            primary="SHA-256 hash being signed"
            secondary={getSignedHash(object)}
            variant="standard"
          />
          {renderObjectAgreement(index)}
        </CollapsibleListSection>
      );
    });
  };

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
      title="Review the data to be signed"
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
            disabled={loading || !hasAgreedToAll}
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
              primary="Signing as"
              secondary={createIdentityDescriptor(activeIdentity)}
              slotProps={LIST_ITEM_SLOTS.standard}
            />
          </ListItem>

          {dataPacketDetails.hasStatements() &&
            dataPacketDetails.statements &&
            dataPacketDetails.statements.length > 0 && (
              <>
                <ListItem divider>
                  <ListItemText
                    primary="Statements"
                    slotProps={{
                      primary: {variant: 'subtitle1' as const},
                    }}
                  />
                </ListItem>

                <List component="div" dense disablePadding>
                  {dataPacketDetails.statements.map((statement, index) => (
                    <ListItem key={index} divider sx={{pl: 4}}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={!!agreedStatements[index]}
                            onChange={e =>
                              setAgreedStatements(current => ({
                                ...current,
                                [index]: e.target.checked,
                              }))
                            }
                            color="primary"
                          />
                        }
                        label={statement}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

          {dataPacketDetails.signableObjects &&
            dataPacketDetails.signableObjects.length > 0 &&
            renderSignableObjects()}
        </List>
      </Card>
    </PageLayout>
  );
};

export default DataPacket;
