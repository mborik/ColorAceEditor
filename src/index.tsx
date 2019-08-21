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

const store = createStore(
	editorReducer,
	applyMiddleware(thunkMiddleware, createLogger())
);

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('wrapper')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
serviceWorker.unregister();
