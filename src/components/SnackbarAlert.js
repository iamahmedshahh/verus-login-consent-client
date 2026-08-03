import React from 'react';
import {Alert, Snackbar} from '@mui/material';

export const SnackbarAlert = ({open, text, handleClose}) => {
  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
      <Alert onClose={handleClose} severity="error" variant="filled" sx={{width: '100%'}}>
        {text}
      </Alert>
    </Snackbar>
  );
};
