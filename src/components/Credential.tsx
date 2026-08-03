import React, {useState} from 'react';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import {Credential} from 'verus-typescript-primitives';

interface CredentialProps {
  credential: Credential;
}

const UnknownCredential: React.FC<CredentialProps> = ({credential}) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  const credentialKey = credential.credentialKey;
  const credentialContents = credential.credential;

  const formattedCredential = JSON.stringify(credentialContents, null, 2);

  return (
    <>
      <ListItemButton divider onClick={handleClick}>
        <ListItemText primary={credentialKey} disableTypography sx={{pr: 4}} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" dense disablePadding>
          <ListItem divider dense sx={{pl: 4, pr: 4}}>
            <ListItemText
              primary={formattedCredential}
              disableTypography
              sx={{
                whiteSpace: 'pre-wrap',
              }}
            />
          </ListItem>
        </List>
      </Collapse>
    </>
  );
};

const PlainLoginCredential: React.FC<CredentialProps> = ({credential}) => {
  const [open, setOpen] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const credentialContents = credential.credential as [string, string];
  const username = credentialContents[0];
  const password = credentialContents[1];
  const passwordMask = password ? '•'.repeat(password.length) : '';

  return (
    <>
      <ListItemButton divider onClick={handleClick}>
        <ListItemText primary="Plain Login" disableTypography sx={{pr: 4}} />
        <ListItemText primary="Username and Password" disableTypography sx={{textAlign: 'right'}} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem divider dense sx={{pl: 4, pr: 4}}>
            <ListItemText primary={'Username'} disableTypography />
            <ListItemText
              primary={username}
              disableTypography
              sx={{
                textAlign: 'right',
                color: '#878787',
              }}
            />
          </ListItem>
          <ListItem divider dense sx={{pl: 4, pr: 4}}>
            <ListItemText primary="Password" disableTypography />
            <div style={{display: 'flex', alignItems: 'center'}}>
              <ListItemText
                primary={showPassword ? password : passwordMask}
                disableTypography
                sx={{
                  textAlign: 'right',
                  color: '#878787',
                  marginRight: '8px',
                }}
              />
              <IconButton edge="end" onClick={togglePasswordVisibility} size="small">
                {showPassword ? (
                  <VisibilityOff fontSize="small" />
                ) : (
                  <Visibility fontSize="small" />
                )}
              </IconButton>
            </div>
          </ListItem>
        </List>
      </Collapse>
    </>
  );
};

export {PlainLoginCredential, UnknownCredential};
