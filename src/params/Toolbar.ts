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

	/** Key combo */
	hotkey: string;

	/** Currently active button flag */
	active?: boolean;
}

export const ToolbarItems: ToolbarItem[] = [{
	id: EditorTool.Selection,
	icon: 'select',
	title: 'selection',
	hotkey: 'S'
}, {
	id: EditorTool.AttrSelect,
	icon: 'new-grid-item',
	title: 'attr.selection',
	hotkey: 'A'
}, {
	id: EditorTool.Pencil,
	icon: 'edit',
	title: 'pencil',
	hotkey: 'P'
}, {
	id: EditorTool.Brush,
	icon: 'highlight',
	title: 'brush',
	hotkey: 'B'
}, {
	id: EditorTool.Fill,
	icon: 'tint',
	title: 'fill',
	hotkey: 'F'
}, {
	id: EditorTool.Lines,
	icon: 'new-link',
	title: 'lines',
	hotkey: 'L'
}, {
	id: EditorTool.Ellipse,
	icon: 'layout-circle',
	title: 'ellipse',
	hotkey: 'E'
}, {
	id: EditorTool.Rectangle,
	icon: 'widget',
	title: 'rectangle',
	hotkey: 'R'
}];
