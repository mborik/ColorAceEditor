/*
 * PMD 85 ColorAce picture editor
 * App entry component
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import * as React from 'react';
import AboutDlg from './AboutDlg';
import Main from './Main';
import Navigation from './Navigation';
import ResultsDlg from './ResultsDlg';


const App: React.VFC = () => (
	<>
		<hr hidden id="progress" />
		<AboutDlg />
		<ResultsDlg />
		<Navigation />
		<Main />
	</>
);


export default App;
