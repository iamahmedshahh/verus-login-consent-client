import React from 'react';
import {useSelector} from 'react-redux';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import {
  CompactIAddressObject,
  ContentMultiMapPrimitive,
  FqnVdxfUniValue,
  VdxfUniType,
} from 'verus-typescript-primitives';

import {RootState} from '#/redux/store';
import {getVDXFKeyLabel} from '#/utils/vdxfTypeLabels';

import VdxfKeyRenderer from './VdxfKeyRenderer';

interface ContentMultiMapRendererProps {
  contentMultiMapEntries: Array<[CompactIAddressObject, ContentMultiMapPrimitive[]]>;
}

const ContentMultiMapRenderer: React.FC<ContentMultiMapRendererProps> = ({
  contentMultiMapEntries,
}) => {
  const definedDataKeys = useSelector(
    (state: RootState) => state.genericRequest.definedDataKeys.keys
  );

  const getReadableName = (vdxfId: string): string => {
    const staticLabel = getVDXFKeyLabel(vdxfId, true);
    if (staticLabel) {
      return staticLabel;
    }
    return definedDataKeys?.[vdxfId]?.label ?? vdxfId;
  };

  const renderPrimitiveValue = (
    primitive: ContentMultiMapPrimitive,
    index: number
  ): React.ReactElement => {
    if (Buffer.isBuffer(primitive)) {
      // Convert Buffers to hex string for display.
      return (
        <ListItem key={index} dense sx={{pl: 4}}>
          <ListItemText
            primary="Buffer (hex)"
            secondary={primitive.toString('hex')}
            slotProps={{
              primary: {variant: 'body2', color: 'text.secondary'},
              secondary: {
                variant: 'body2',
                color: 'text.primary',
                sx: {wordBreak: 'break-all', fontSize: '0.75rem', fontFamily: 'monospace'},
              },
            }}
          />
        </ListItem>
      );
    } else if (primitive instanceof FqnVdxfUniValue) {
      const vdxfEntries = Array.from(primitive.entries()).map(
        ([key, value]): [string, VdxfUniType] => [key.toAddress(), value]
      );
      return (
        <Box key={index}>
          {vdxfEntries.length > 0 ? (
            vdxfEntries.map(([vdxfKey, vdxfValue], vdxfIndex) => {
              return (
                <VdxfKeyRenderer
                  key={`${index}-${vdxfIndex}`}
                  vdxfKey={vdxfKey}
                  vdxfValue={vdxfValue}
                  index={index}
                  vdxfIndex={vdxfIndex}
                />
              );
            })
          ) : (
            <ListItem dense sx={{pl: 6}}>
              <ListItemText
                primary="No VDXF keys found"
                slotProps={{
                  primary: {variant: 'body2', color: 'text.secondary', fontStyle: 'italic'},
                }}
              />
            </ListItem>
          )}
        </Box>
      );
    } else {
      // Fallback for unknown types.
      return (
        <ListItem key={index} dense sx={{pl: 4}}>
          <ListItemText
            primary="Unknown type"
            secondary={String(primitive)}
            slotProps={{
              primary: {variant: 'body2', color: 'text.secondary'},
              secondary: {
                variant: 'body2',
                color: 'text.primary',
                sx: {wordBreak: 'break-all', fontSize: '0.75rem'},
              },
            }}
          />
        </ListItem>
      );
    }
  };

  if (contentMultiMapEntries.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" textAlign="center">
        No data to add
      </Typography>
    );
  }

  return (
    <List>
      {contentMultiMapEntries.map(([key, values], entryIndex) => {
        const keyAddress = key.toAddress();
        return (
          <Box key={entryIndex}>
            <ListItem divider>
              <ListItemText
                primary={getReadableName(keyAddress)}
                secondary={keyAddress}
                slotProps={{
                  primary: {variant: 'body1', fontWeight: 'bold'},
                  secondary: {
                    color: 'text.secondary',
                    variant: 'body2',
                    sx: {wordBreak: 'break-all', fontSize: '0.75rem'},
                  },
                }}
              />
            </ListItem>
            {values && values.length > 0 && (
              <Box sx={{backgroundColor: 'grey.50'}}>
                {values.map((primitive, valueIndex) => renderPrimitiveValue(primitive, valueIndex))}
              </Box>
            )}
          </Box>
        );
      })}
    </List>
  );
};

export default ContentMultiMapRenderer;
