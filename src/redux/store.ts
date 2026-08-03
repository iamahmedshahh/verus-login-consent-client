import {configureStore} from '@reduxjs/toolkit';

import rootReducer from './rootReducer';

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['deeplink/setDeeplinkData', 'genericResponse/SET_GENERIC_RESPONSE'],
        ignoredPaths: ['deeplink.data', 'error.error'],
      },
    }),
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
