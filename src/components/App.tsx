/*
 * PMD 85 ColorAce picture editor
 * App entry component
 *
 * Copyright (c) 2019 Martin Bórik
 */

import React from 'react';
import Navigation from './Navigation';
import Main from './Main';

const App: React.FunctionComponent = () => {
	return <>
		<Navigation />
		<Main />
	</>;
}

export default App;
