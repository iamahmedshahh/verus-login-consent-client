import React from 'react';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import {
  Credential,
  DATA_TYPE_OBJECT_CREDENTIAL,
  IDENTITY_CREDENTIAL_PLAINLOGIN,
  VdxfUniType,
} from 'verus-typescript-primitives';

import {PlainLoginCredential, UnknownCredential} from '#/components/Credential';
import {getVDXFKeyLabel} from '#/utils/vdxfTypeLabels';

interface VdxfKeyRendererProps {
  vdxfKey: string;
  vdxfValue: VdxfUniType;
  index: number;
  vdxfIndex: number;
}

const VdxfKeyRenderer: React.FC<VdxfKeyRendererProps> = ({
  vdxfKey,
  vdxfValue,
  index,
  vdxfIndex,
}) => {
  const getReadableName = (vdxfId: string): string => {
    return getVDXFKeyLabel(vdxfId);
  };

  const getJsonDisplay = (value: VdxfUniType): React.JSX.Element => {
    let jsonValue = '';
    try {
      if (Buffer.isBuffer(value)) {
        jsonValue = JSON.stringify(value.toString('hex'), null, 2);
      } else if (typeof value === 'string') {
        jsonValue = JSON.stringify(value, null, 2);
      } else if (
        value &&
        typeof value === 'object' &&
        'toJson' in value &&
        typeof value.toJson === 'function'
      ) {
        jsonValue = JSON.stringify(value.toJson(), null, 2);
      } else {
        jsonValue = JSON.stringify(value, null, 2);
      }
    } catch (error) {
      throw new Error(`Error serializing to JSON: ${error}`);
    }

    return (
      <ListItem dense sx={{pl: 8}}>
        <ListItemText
          primary="JSON Value:"
          secondary={jsonValue}
          slotProps={{
            primary: {
              variant: 'caption',
              color: 'text.secondary',
              sx: {fontSize: '0.6rem', fontWeight: 'bold'},
            },
            secondary: {
              variant: 'body2',
              color: 'text.primary',
              sx: {
                wordBreak: 'break-all',
                fontSize: '0.7rem',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                padding: '8px',
                borderRadius: '4px',
                marginTop: '4px',
              },
            },
          }}
        />
      </ListItem>
    );
  };

  // Add temporary rendering based on the vdxfkey until UI design is finalized.
  const renderValueByVdxfKey = (): React.JSX.Element => {
    switch (vdxfKey) {
      case DATA_TYPE_OBJECT_CREDENTIAL.vdxfid:
        return renderCredential(vdxfValue as Credential);
    }

    return getJsonDisplay(vdxfValue);
  };

  const renderCredential = (cred: Credential): React.JSX.Element => {
    const credKey = cred.credentialKey;
    switch (credKey) {
      case IDENTITY_CREDENTIAL_PLAINLOGIN.vdxfid:
        return <PlainLoginCredential credential={cred} />;
      default:
        return <UnknownCredential credential={cred} />;
    }
  };

  return (
    <Box key={`${index}-${vdxfIndex}`}>
      <ListItem dense sx={{pl: 6}}>
        <ListItemText
          primary={getReadableName(vdxfKey)}
          secondary={vdxfKey}
          slotProps={{
            primary: {variant: 'body2'},
            secondary: {
              color: 'text.secondary',
              variant: 'caption',
              sx: {wordBreak: 'break-all', fontSize: '0.65rem'},
            },
          }}
        />
      </ListItem>
      {renderValueByVdxfKey()}
    </Box>
  );
};

export default VdxfKeyRenderer;
