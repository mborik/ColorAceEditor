/*
 * PMD 85 ColorAce picture editor
 * Palette item definitions
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import { IconName } from '@blueprintjs/core';
import { Editor, EditorColorMode } from '../editor';


export interface PaletteItem {
	/** Unique identifier */
	id: string;

	/** Color value for Editor */
	value: number;

	/** Attribute definition */
	attrs?: (editor: Editor) => string[];

	/** Attribute definition */
	shouldBeShown: (editor: Editor) => boolean;

	/**
	 * BlueprintJS icon identifier
	 * @see https://blueprintjs.com/docs/#icons
	 */
	icon?: IconName;

	/** CSS Style for palette entry */
	color?: string;

	/** Currently active button flag */
	active?: boolean;
}

export const PaletteItems: PaletteItem[] = [{
	id: 'TBPL_COLOR0',
	icon: 'helper-management',
	value: 0,
	shouldBeShown: () => true
}, {
	id: 'TBPL_COLOR1',
	attrs: ({ editColorMode }) => editColorMode === EditorColorMode.Full ? ['01', '01'] : ['01'],
	color: '#ff0000',
	value: 1,
	shouldBeShown: ({ editColorMode }) => editColorMode !== EditorColorMode.Mono
}, {
	id: 'TBPL_COLOR2',
	attrs: ({ editColorMode }) => editColorMode === EditorColorMode.Full ? ['10', '10'] : ['10'],
	color: '#0000ff',
	value: 2,
	shouldBeShown: ({ editColorMode }) => editColorMode !== EditorColorMode.Mono
}, {
	id: 'TBPL_COLOR3',
	attrs: ({ editColorMode }) => editColorMode === EditorColorMode.Full ? ['11', '11'] : ['11'],
	color: '#ff00ff',
	value: 3,
	shouldBeShown: ({ editColorMode }) => editColorMode !== EditorColorMode.Mono
}, {
	id: 'TBPL_COLOR4',
	attrs: ({ editColorMode }) => editColorMode === EditorColorMode.Full ? ['00', '00'] : ['00'],
	color: '#00ff00',
	value: 4,
	shouldBeShown: ({ editColorMode }) => editColorMode !== EditorColorMode.Mono
}, {
	id: 'TBPL_COLOR5',
	attrs: () => [ '01', '00' ],
	color: '#ffff00',
	value: 5,
	shouldBeShown: ({ editColorMode }) => editColorMode === EditorColorMode.Full
}, {
	id: 'TBPL_COLOR6',
	attrs: () => [ '10', '00' ],
	color: '#00ffff',
	value: 6,
	shouldBeShown: ({ editColorMode }) => editColorMode === EditorColorMode.Full
}, {
	id: 'TBPL_COLOR7',
	attrs: () => [ '11', '00' ],
	color: '#ffffff',
	value: 7,
	shouldBeShown: ({ editColorMode }) => editColorMode === EditorColorMode.Full
}, {
	id: 'TBPL_MONO1',
	attrs: () => ['01'],
	color: '#666666',
	value: 1,
	shouldBeShown: ({ editColorMode }) => editColorMode === EditorColorMode.Mono
}, {
	id: 'TBPL_MONO2',
	attrs: () => ['10'],
	color: '#999999',
	value: 2,
	shouldBeShown: ({ editColorMode }) => editColorMode === EditorColorMode.Mono
}, {
	id: 'TBPL_MONO3',
	attrs: () => ['11'],
	color: '#bbbbbb',
	value: 3,
	shouldBeShown: ({ editColorMode }) => editColorMode === EditorColorMode.Mono
}, {
	id: 'TBPL_MONO4',
	attrs: () => ['00'],
	color: '#ffffff',
	value: 4,
	shouldBeShown: ({ editColorMode }) => editColorMode === EditorColorMode.Mono
}];
