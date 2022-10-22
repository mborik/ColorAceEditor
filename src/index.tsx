/*
 * PMD 85 ColorAce picture editor
 * React app entry point and initialization
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HotkeysProvider } from '@blueprintjs/core';
import App from './components/App';
import EditorProvider from './editor';
import { APP_WRAPPER } from './elements';

(async () => {
  await import('./index.scss');
  ReactDOM.render((
    <HotkeysProvider>
      <EditorProvider>
        <App />
      </EditorProvider>
    </HotkeysProvider>
  ), APP_WRAPPER());
})();
