import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import {DataPacketRequestOrdinalVDXFObject, GenericRequest} from 'verus-typescript-primitives';

import CollapsibleListSection from '#/components/CollapsibleListSection';
import NestedListItem from '#/components/NestedListItem';
import PageLayout from '#/components/PageLayout';
import {isLastDetail} from '#/features/details/detailNavigation';
import {useAppDispatch} from '#/redux/hooks';
import {setError} from '#/redux/reducers/error/error.actions';
import {
  navigateBackGenericRequest,
  navigateGenericRequest,
} from '#/redux/reducers/navigation/navigationSlice';
import {RootState} from '#/redux/store';

const DataPacket: React.FC = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<boolean>(false);

  const deeplinkData = useSelector((state: RootState) => state.deeplink.data);
  const currentDetailIndex = useSelector((state: RootState) => state.navigation.currentDetailIndex);

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
                    <NestedListItem key={index} primary={statement} />
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
