import { SET_CREDENTIALS } from './credentials.types';

export const credentials = (state = {
  credentials: []
}, action) => {
  switch (action.type) {
  case SET_CREDENTIALS:
    return {
      ...state,
      credentials: action.payload.credentials
    };
  default:
    return state;
  }
}; 