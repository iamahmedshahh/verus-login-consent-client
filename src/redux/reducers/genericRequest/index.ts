import {combineReducers} from '@reduxjs/toolkit';

import appOrDelegatedIdReducer from './appOrDelegatedIdSlice';
import authReducer from './authenticationSlice';
import definedDataKeysReducer from './definedDataKeysSlice';
import userDataReducer from './userDataSlice';

const genericRequestReducer = combineReducers({
  authDetails: authReducer,
  userData: userDataReducer,
  appOrDelegatedId: appOrDelegatedIdReducer,
  definedDataKeys: definedDataKeysReducer,
});

export default genericRequestReducer;
