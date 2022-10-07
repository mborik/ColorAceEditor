/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019-2022 Martin Bórik
 */

const devLog = (...args) => {
	if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development' ||
		window.location.href.startsWith('#dev')) {

		// eslint-disable-next-line no-console
		console.log(...args);
	}
};

export default devLog;
