/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019 Martin Bórik
 */

const devLog = (...args) => {
	if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development' ||
		window.location.href.startsWith('#dev')) {

		console.log.apply(console, args);
	}
};

export default devLog;
