/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019-2022 Martin Bórik
 */

export interface DemoScreenItem {
	/** Screen name */
	name: string;

	/** Author(s) */
	author: string;

	/** PMD 85 Screen dump file path relative to `/public` */
	filename: string;
}

export const DemoScreenItems: DemoScreenItem[] = [
	{
		name: 'Magicland Dizzy',
		author: 'Chris Graham, Zdeněk Šesták',
		filename: 'screen.db/magicland.bin'
	}, {
		name: 'R-Type',
		author: 'MaK',
		filename: 'screen.db/rtype.bin'
	}, {
		name: 'Owls',
		author: 'mike/ZeroTeam',
		filename: 'screen.db/owls.bin'
	}, {
		name: 'Atomix',
		author: 'mborik128/RM-TEAM',
		filename: 'screen.db/atomix.bin'
	}, {
		name: 'Highway Encounter',
		author: 'mborik128/RM-TEAM',
		filename: 'screen.db/hienc.bin'
	}, {
		name: 'Kvádro',
		author: 'mborik128/RM-TEAM',
		filename: 'screen.db/kvadro.bin'
	}, {
		name: 'Turing',
		author: 'mborik128/RM-TEAM',
		filename: 'screen.db/turing.bin'
	}
];
