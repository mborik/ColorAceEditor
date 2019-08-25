/*
 * PMD 85 ColorAce picture editor
 * Toolbar item definitions
 *
 * Copyright (c) 2019 Martin Bórik
 */

import { IconName } from "@blueprintjs/core";
import { EditorTool } from "../editor/Editor";


export interface ToolbarItem {
	/** Unique identifier */
	id: EditorTool;

	/**
	 * BlueprintJS icon identifier
	 * @see https://blueprintjs.com/docs/#icons
	 */
	icon: IconName;

	/** Tooltip */
	title: string;

	/** Currently active button flag */
	active?: boolean;
}

export const ToolbarItems: ToolbarItem[] = [{
	id: EditorTool.Selection,
	icon: 'select',
	title: 'selection'
}, {
	id: EditorTool.GridSelect,
	icon: 'new-grid-item',
	title: 'grid selection'
}, {
	id: EditorTool.Pencil,
	icon: 'edit',
	title: 'pencil'
}, {
	id: EditorTool.Brush,
	icon: 'highlight',
	title: 'brush'
}, {
	id: EditorTool.Fill,
	icon: 'eraser',
	title: 'fill'
}, {
	id: EditorTool.Lines,
	icon: 'new-link',
	title: 'lines'
}, {
	id: EditorTool.Ellipse,
	icon: 'layout-circle',
	title: 'ellipse'
}, {
	id: EditorTool.Rectangle,
	icon: 'widget',
	title: 'rectangle'
}];
