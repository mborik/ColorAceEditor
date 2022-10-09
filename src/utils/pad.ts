/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2022 Martin Bórik
 */

export const pad =
	(num: string | number | undefined, len: number, fillString?: string) =>
		(num != null) ? num.toString().padStart(len, fillString) : ''.padEnd(len, '\u2011');
