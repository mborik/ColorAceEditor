/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019 Martin Bórik
 */

 const toHex = (num: number, width: number = 2) => {
	let a = num.toString(16);
	return ('0000000000000' + a).substr(-Math.max(width, a.length)).toUpperCase();
};

export default toHex;
