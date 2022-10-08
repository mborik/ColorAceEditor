/*
 * PMD 85 ColorAce picture editor
 * Selection toolbar item definitions
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import { IconName } from '@blueprintjs/core';
import { Editor } from '../editor/Editor';
import {
	actionSelectAll,
	actionSelectNone,
	actionSelectClear,
	actionSelectCopy,
	DispatchAction
} from '../actions/base';


export type SelectToolItemAction = (editor: Editor) => DispatchAction;

export interface SelectToolItem {
	/** Unique identifier */
	id: string;

	/** Reducer action */
	action?: SelectToolItemAction;

	/**
	 * BlueprintJS icon identifier
	 * @see https://blueprintjs.com/docs/#icons
	 */
	icon: IconName;

	/** Tooltip */
	title: string;

	/** Key combo */
	hotkey: string;

	/** Force enabled button flag */
	enabled?: boolean;

	/** Currently active button flag */
	active?: boolean;
}

export const SelectToolItems: SelectToolItem[] = [{
	id: 'TBST_SELECTALL',
	icon: 'fullscreen',
	title: 'select all',
	hotkey: 'mod+A',
	enabled: true,
	action: () => actionSelectAll()
}, {
	id: 'TBST_DESELECT',
	icon: 'disable',
	title: 'deselect',
	hotkey: 'mod+D',
	action: () => actionSelectNone()
}, {
	id: 'TBST_CUT',
	icon: 'cut',
	title: 'cut',
	hotkey: 'mod+X',
	action: () => actionSelectCopy(true)
}, {
	id: 'TBST_CLONE',
	icon: 'duplicate',
	title: 'clone',
	hotkey: 'mod+C',
	action: () => actionSelectCopy(false)
}, {
	id: 'TBST_CLEAR',
	icon: 'eraser',
	title: 'clear',
	hotkey: 'del',
	action: () => actionSelectClear()
}];
