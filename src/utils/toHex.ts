/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019-2022 Martin Bórik
 */

export const toHex = (num: number, width: number = 2) => {
	const a = num.toString(16);
	return ('0000000000000' + a).substring(-Math.max(width, a.length)).toUpperCase();
};
