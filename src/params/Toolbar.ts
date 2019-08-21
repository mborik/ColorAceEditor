/*
 * PMD 85 ColorAce picture editor
 * Toolbar item definitions
 *
 * Copyright (c) 2019 Martin Bórik
 */

import { IconName } from "@blueprintjs/core";

export interface ToolbarItem {
	/** Unique identifier */
	id: string;

	/**
	 * BlueprintJS icon identifier
	 * @see https://blueprintjs.com/docs/#icons
	 */
	icon: IconName;

	/** Button display name */
	title: string;

	/** Currently active button flag */
	active?: boolean;
}

export const ToolbarItems: ToolbarItem[] = [{
	id: 'tool0',
	icon: 'select',
	title: 'selection'
}, {
	id: 'tool1',
	icon: 'new-grid-item',
	title: 'grid selection'
}, {
	id: 'tool2',
	icon: 'edit',
	title: 'pencil'
}, {
	id: 'tool3',
	icon: 'highlight',
	title: 'brush'
}, {
	id: 'tool4',
	icon: 'tint',
	title: 'fill'
}, {
	id: 'tool5',
	icon: 'new-link',
	title: 'lines'
}, {
	id: 'tool6',
	icon: 'layout-circle',
	title: 'ellipse'
}, {
	id: 'tool7',
	icon: 'widget',
	title: 'rectangle'
}];
