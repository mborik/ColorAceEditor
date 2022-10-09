/*
 * PMD 85 ColorAce picture editor
 * Palette item definitions
 *
 * Copyright (c) 2022 Martin Bórik
 */

import { EditorColorMode } from '../editor';


export interface ColorModeItem {
	/** Unique identifier - Color mode of Editor */
	id: EditorColorMode;

	/** Label */
	label: string;
}

export const ColorModeItems: ColorModeItem[] = [{
	id: EditorColorMode.Full,
	label: 'ColorACE'
}, {
	id: EditorColorMode.RGB,
	label: 'RGB'
}, {
	id: EditorColorMode.Mono,
	label: 'Monochromatic'
}];
