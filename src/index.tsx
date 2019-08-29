/*
 * PMD 85 ColorAce picture editor
 * React app entry point, Redux store/reducer initialization
 *
 * Copyright (c) 2019 Martin Bórik
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk';

import App from './components/App';
import { editorReducer } from './reducers/editor';
import * as serviceWorker from './serviceWorker';
import './index.scss';


const dev: boolean = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development');

const store = createStore(
	editorReducer,
	applyMiddleware(
		thunkMiddleware,
		...(dev ? [ createLogger() ] : [])
	)
);

ReactDOM.render(
	<Provider store={store}>
		<App {...store} />
	</Provider>,
	document.getElementById('wrapper')
);

// in production we want to work offline and load faster...
if (dev) {
	serviceWorker.unregister();
} else {
	serviceWorker.register();
}
