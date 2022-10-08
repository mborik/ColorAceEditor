/*
 * PMD 85 ColorAce picture editor
 * Selection toolbar item definitions
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import { IconName } from '@blueprintjs/core';
import { EditorDirection } from '../editor/Editor';
import { actionSelectShift } from '../actions/selectShift';
import { actionSelectInvert } from '../actions';
import { SelectToolItemAction } from './SelectToolItems';


export interface SelectToolSubMenuItem {
	/** Divider item */
	divider?: boolean;

	/** Unique identifier */
	id?: string;

	/** Reducer action */
	action?: SelectToolItemAction;

	/**
	 * BlueprintJS icon identifier
	 * @see https://blueprintjs.com/docs/#icons
	 */
	icon?: IconName;

	/** Caption */
	text?: string;

	/** Key combo */
	hotkey?: string;

	/** Checkbox flag */
	checkbox?: boolean;

	/** Checkbox alternative caption */
	checkedText?: string;

	/** Property in Editor which affects checkbox state */
	checkboxProperty?: string;
}

export const SelectToolSubMenuItems: SelectToolSubMenuItem[] = [{
	id: 'TBSM_INVERT',
	icon: 'right-join',
	text: 'Invert',
	hotkey: 'mod+I',
	action: () => actionSelectInvert()
}, {
	divider: true
}, {
	id: 'TBSM_FLIP_H',
	icon: 'double-caret-horizontal',
	text: 'Flip Horizontal',
	action: editor => actionSelectShift(editor, EditorDirection.FH)
}, {
	id: 'TBSM_FLIP_V',
	icon: 'double-caret-vertical',
	text: 'Flip Vertical',
	action: editor => actionSelectShift(editor, EditorDirection.FV)
}, {
	divider: true
}, {
	id: 'TBSM_MOVE_UP',
	icon: 'double-chevron-up',
	text: 'Shift Up',
	hotkey: 'mod+up',
	action: editor => actionSelectShift(editor, EditorDirection.UP)
}, {
	id: 'TBSM_MOVE_LEFT',
	icon: 'double-chevron-left',
	text: 'Shift Left',
	hotkey: 'mod+left',
	action: editor => actionSelectShift(editor, EditorDirection.LT)
}, {
	id: 'TBSM_MOVE_RIGHT',
	icon: 'double-chevron-right',
	text: 'Shift Right',
	hotkey: 'mod+right',
	action: editor => actionSelectShift(editor, EditorDirection.RT)
}, {
	id: 'TBSM_MOVE_DOWN',
	icon: 'double-chevron-down',
	text: 'Shift Down',
	hotkey: 'mod+down',
	action: editor => actionSelectShift(editor, EditorDirection.DN)
}, {
	divider: true
}, {
	id: 'TBSM_CHECKBOX_SCROLL',
	icon: 'flows',
	text: 'Scroll shift',
	checkbox: true,
	checkboxProperty: 'editSelectFnShiftWrap',
	checkedText: 'Wrap around (roll)'
}, {
	id: 'TBSM_CHECKBOX_ATTRS',
	icon: 'split-columns',
	text: 'Shift / flip by attributes',
	checkbox: true,
	checkboxProperty: 'editSelectFnShiftAttr'
}, {
	id: 'TBSM_CHECKBOX_BLOCK',
	icon: 'th-derived',
	text: 'Cut or clone with attributes',
	checkbox: true,
	checkboxProperty: 'editSelectFnBlockAttr'
}];
