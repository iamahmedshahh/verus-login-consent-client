import React, {useState} from 'react';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import {LIST_ITEM_SLOTS} from '#/components/listItemSlots';

interface CollapsibleListSectionProps {
  title: string;
  subtitle?: string;
  divider?: boolean;
  initiallyExpanded?: boolean;
  collapseHint?: boolean;
  children: React.ReactNode;
}

const CollapsibleListSection: React.FC<CollapsibleListSectionProps> = ({
  title,
  subtitle,
  divider = false,
  initiallyExpanded = false,
  collapseHint = true,
  children,
}) => {
  const [open, setOpen] = useState<boolean>(initiallyExpanded);

  const resolvedSubtitle =
    subtitle ?? (collapseHint ? (open ? 'Click to collapse' : 'Click to expand') : undefined);

  return (
    <>
      <ListItemButton divider={divider} onClick={() => setOpen(prev => !prev)}>
        <ListItemText
          primary={resolvedSubtitle}
          secondary={title}
          slotProps={LIST_ITEM_SLOTS.collapsible}
        />
        {open ? <ExpandLess color="action" /> : <ExpandMore color="action" />}
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List
          component="div"
          dense
          disablePadding
          sx={!divider ? {'& > *:last-child': {borderBottom: 'none'}} : undefined}
        >
          {children}
        </List>
      </Collapse>
    </>
  );
};

export default CollapsibleListSection;
