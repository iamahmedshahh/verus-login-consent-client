import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import {LIST_ITEM_SLOTS} from '#/components/listItemSlots';

const NESTED_SX = {pl: 6, pr: 2, py: 0.5, minHeight: 48} as const;

interface NestedListItemProps {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  variant?: 'nested' | 'standard' | 'detail';
}

const NestedListItem: React.FC<NestedListItemProps> = ({
  primary,
  secondary,
  variant = 'nested',
}) => (
  <ListItem divider sx={NESTED_SX}>
    <ListItemText primary={primary} secondary={secondary} slotProps={LIST_ITEM_SLOTS[variant]} />
  </ListItem>
);

export default NestedListItem;
