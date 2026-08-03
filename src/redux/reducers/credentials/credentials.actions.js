import { SET_CREDENTIALS } from './credentials.types';

export const setCredentials = (credentials) => {
  return {
    type: SET_CREDENTIALS,
    payload: {
      credentials
    }
  };
}; 