/*
 * PMD 85 ColorAce picture editor
 * React app entry point, Redux store/reducer initialization
 *
 * Copyright (c) 2019 Martin Bórik
 */

import * as React from "react";
import * as ReactDOM from "react-dom";
import { HotkeysProvider } from '@blueprintjs/core';
import App from './components/App';

(async () => {
	// Wait until CSS is loaded before rendering components because some of them (like Table)
	// rely on those styles to take accurate DOM measurements.
	await import("./index.scss");
	ReactDOM.render((
		<HotkeysProvider>
			<App />
		</HotkeysProvider>
	), document.querySelector("#wrapper"));
})();
