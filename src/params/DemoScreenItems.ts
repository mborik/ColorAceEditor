/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019-2022 Martin Bórik
 */

export interface DemoScreenItem {
	/** Screen name */
	name: string;

	/** Optional image variant */
	variant?: string;

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
		name: 'PSSST',
		variant: 'mono',
		author: 'Ultimate, Libor Lasota',
		filename: 'screen.db/pssst.bin'
	}, {
		name: 'Atomix',
		author: 'mborik128/RM-TEAM',
		filename: 'screen.db/atomix.bin'
	}, {
		name: 'Atomix',
		variant: 'mono',
		author: 'mborik128/RM-TEAM',
		filename: 'screen.db/atomix_m.bin'
	}, {
		name: 'Highway Encounter',
		author: 'mborik128/RM-TEAM',
		filename: 'screen.db/hienc.bin'
	}, {
		name: 'Highway Encounter',
		variant: 'mono',
		author: 'mborik128/RM-TEAM',
		filename: 'screen.db/hienc_m.bin'
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
