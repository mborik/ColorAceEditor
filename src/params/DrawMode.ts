/*
 * PMD 85 ColorAce picture editor
 * Toolbar item definitions
 *
 * Copyright (c) 2019 Martin Bórik
 */

import { EditorDrawMode } from "../editor/Editor";


export interface DrawModeItem {
	/** Unique identifier */
	id: EditorDrawMode;

	/** Button caption */
	caption: string;

	/** Tooltip */
	title: string;

	/** Currently active button flag */
	active?: boolean;
}

export const DrawModeItems: DrawModeItem[] = [{
	id: EditorDrawMode.Reset,
	caption: 'RES',
	title: 'reset'
}, {
	id: EditorDrawMode.Set,
	caption: 'SET',
	title: 'set'
}, {
	id: EditorDrawMode.Over,
	caption: 'OVR',
	title: 'over'
}, {
	id: EditorDrawMode.Color,
	caption: 'COL',
	title: 'colorize'
}];
