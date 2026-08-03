import 'buffer';
import './utils/bn-polyfill';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {createHashRouter, RouterProvider} from 'react-router-dom';
import {Provider} from 'react-redux';
import store from './redux/store';

import App from './App';
import './index.css';
import ErrorBoundary from './screens/LoginConsent/Error/ErrorBoundary';
import {ThemeProvider} from '@mui/material/styles';
import {mainTheme} from './themes/main';

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
  },
]);

const container = document.getElementById('app');
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <ThemeProvider theme={mainTheme}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </ThemeProvider>
  </Provider>
);
