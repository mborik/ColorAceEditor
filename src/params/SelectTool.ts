/*
 * PMD 85 ColorAce picture editor
 * Selection toolbar item definitions
 *
 * Copyright (c) 2019 Martin Bórik
 */

import { IconName } from "@blueprintjs/core";


export interface SelectToolItem {
	/** Unique identifier */
	id: string;

	/**
	 * BlueprintJS icon identifier
	 * @see https://blueprintjs.com/docs/#icons
	 */
	icon: IconName;

	/** Tooltip */
	title: string;

	/** Force enabled button flag */
	enabled?: boolean;

	/** Currently active button flag */
	active?: boolean;
}

export interface SelectToolSubMenuItem {
	/** Divider item */
	divider?: boolean;

	/** Unique identifier */
	id?: string;

	/**
	 * BlueprintJS icon identifier
	 * @see https://blueprintjs.com/docs/#icons
	 */
	icon?: IconName;

	/** Caption */
	text?: string;

	/** Checkbox flag and alternative caption */
	checkbox?: boolean;
	checkedText?: string;

	/** Property in Editor which affects checkbox state */
	checkboxProperty?: string;
}

export const SelectToolItems: SelectToolItem[] = [{
	id: 'TBST_SELECTALL',
	icon: 'zoom-to-fit',
	title: 'select all',
	enabled: true
}, {
	id: 'TBST_DESELECT',
	icon: 'disable',
	title: 'deselect'
}, {
	id: 'TBST_CUT',
	icon: 'cut',
	title: 'cut'
}, {
	id: 'TBST_CLONE',
	icon: 'duplicate',
	title: 'clone'
}, {
	id: 'TBST_CLEAN',
	icon: 'eraser',
	title: 'clean'
}];

export const SelectToolSubMenu: SelectToolSubMenuItem[] = [{
	id: 'TBSM_INVERT',
	icon: 'right-join',
	text: 'Invert'
}, {
	divider: true
}, {
	id: 'TBSM_FLIP_H',
	icon: 'double-caret-horizontal',
	text: 'Flip Horizontal'
}, {
	id: 'TBSM_FLIP_V',
	icon: 'double-caret-vertical',
	text: 'Flip Hertical'
}, {
	divider: true
}, {
	id: 'TBSM_MOVE_UP',
	icon: 'double-chevron-up',
	text: 'Shift Up'
}, {
	id: 'TBSM_MOVE_LEFT',
	icon: 'double-chevron-left',
	text: 'Shift Left'
}, {
	id: 'TBSM_MOVE_RIGHT',
	icon: 'double-chevron-right',
	text: 'Shift Right'
}, {
	id: 'TBSM_MOVE_DOWN',
	icon: 'double-chevron-down',
	text: 'Shift Down'
}, {
	divider: true
}, {
	id: 'TBSM_CHECKBOX_SCROLL',
	icon: 'locate',
	text: 'Scroll shift',
	checkbox: true,
	checkboxProperty: 'editSelectFnShiftWrap',
	checkedText: 'Wrap around (roll)'
}, {
	id: 'TBSM_CHECKBOX_ATTRS',
	icon: 'panel-stats',
	text: 'Consider & keep attributes',
	checkbox: true,
	checkboxProperty: 'editSelectFnShiftAttr'
}];
