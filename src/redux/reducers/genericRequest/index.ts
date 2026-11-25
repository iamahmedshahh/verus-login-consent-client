import {combineReducers} from '@reduxjs/toolkit';

import appOrDelegatorIdReducer from './appOrDelegatorIdSlice';
import authReducer from './authenticationSlice';
import definedDataKeysReducer from './definedDataKeysSlice';
import userDataReducer from './userDataSlice';

const genericRequestReducer = combineReducers({
  authDetails: authReducer,
  userData: userDataReducer,
  appOrDelegatorId: appOrDelegatorIdReducer,
  definedDataKeys: definedDataKeysReducer,
});

export default genericRequestReducer;
