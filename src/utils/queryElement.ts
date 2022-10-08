/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2022 Martin Bórik
 */

const cache: { [key: string]: any } = {};
export const queryElement = <T>(selector: string): T =>
	(cache[selector]) ??
	(cache[selector] = document.querySelector(selector) as T);
