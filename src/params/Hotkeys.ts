/*
 * PMD 85 ColorAce picture editor
 * Hotkey definitions & actions
 *
 * Copyright (c) 2019 Martin Bórik
 */

import { IHotkeyProps } from "@blueprintjs/core";
import { Editor, EditorTool, EditorDrawMode } from "../editor/Editor";
import { EditorRootAction } from "../reducers/editor";
import { actionToolChanged, actionDrawModeChanged, actionColorChanged, actionFillShapeChanged } from "../actions/editor";


const isSelection = (editor: Editor) => (
	editor.editTool === EditorTool.Selection ||
	editor.editTool === EditorTool.GridSelect
);

export type HotkeyItemAction =
	(editor: Editor, e: KeyboardEvent) => EditorRootAction;

export class HotkeyItem implements IHotkeyProps {
	/** Unique identifier */
	key: string;

	global: boolean = true;
	preventDefault: boolean = true;
	stopPropagation: boolean = true;

	constructor(
		public group: string,
		public label: string,
		public combo: string,
		public handler: HotkeyItemAction) {

		this.key = `HKEY_${combo.replace(/\W/g, '_').toUpperCase()}`;
	}
}

export const HotkeyItems: HotkeyItem[] = [
	new HotkeyItem(
		'1. Tools',
		'Selection',
		'S',
		() => actionToolChanged(EditorTool.Selection)
	),
	new HotkeyItem(
		'1. Tools',
		'Attribute selection',
		'A',
		() => actionToolChanged(EditorTool.GridSelect)
	),
	new HotkeyItem(
		'1. Tools',
		'Pencil',
		'P',
		() => actionToolChanged(EditorTool.Pencil)
	),
	new HotkeyItem(
		'1. Tools',
		'Brush',
		'B',
		() => actionToolChanged(EditorTool.Brush)
	),
	new HotkeyItem(
		'1. Tools',
		'Lines',
		'L',
		() => actionToolChanged(EditorTool.Lines)
	),
	new HotkeyItem(
		'1. Tools',
		'Ellipse',
		'E',
		() => actionToolChanged(EditorTool.Ellipse)
	),
	new HotkeyItem(
		'1. Tools',
		'Rectangle',
		'R',
		() => actionToolChanged(EditorTool.Rectangle)
	),
	new HotkeyItem(
		'1. Tools',
		'Point Coords Recorder',
		'F9',
		() => actionToolChanged(EditorTool.Recorder)
	),
	new HotkeyItem(
		'2. Draw mode',
		'Over',
		'Z',
		editor => isSelection(editor) ? null :
			actionDrawModeChanged(EditorDrawMode.Over)
	),
	new HotkeyItem(
		'2. Draw mode',
		'Set / Reset',
		'X',
		editor => isSelection(editor) ? null :
			actionDrawModeChanged((editor.editMode === EditorDrawMode.Set ?
				EditorDrawMode.Reset : EditorDrawMode.Set))
	),
	new HotkeyItem(
		'2. Draw mode',
		'Colorize',
		'C',
		editor => isSelection(editor) ? null :
			actionDrawModeChanged(EditorDrawMode.Color)
	),
	new HotkeyItem(
		'2. Draw mode',
		'Filled shape',
		'V',
		editor => (
			editor.editTool === EditorTool.Ellipse ||
			editor.editTool === EditorTool.Rectangle
		) ? actionFillShapeChanged(!editor.editFilled) : null
	),
	new HotkeyItem(
		'3. Palette',
		'0: No color (attrs not modified)',
		'D',
		() => actionColorChanged(0)
	),
	new HotkeyItem(
		'3. Palette',
		'1: Red',
		'1',
		() => actionColorChanged(1)
	),
	new HotkeyItem(
		'3. Palette',
		'2: Blue',
		'2',
		() => actionColorChanged(2)
	),
	new HotkeyItem(
		'3. Palette',
		'3: Fuchsia',
		'3',
		() => actionColorChanged(3)
	),
	new HotkeyItem(
		'3. Palette',
		'4: Green',
		'4',
		() => actionColorChanged(4)
	),
	new HotkeyItem(
		'3. Palette',
		'5: Cyan',
		'5',
		() => actionColorChanged(5)
	),
	new HotkeyItem(
		'3. Palette',
		'6: Yellow',
		'6',
		() => actionColorChanged(6)
	),
	new HotkeyItem(
		'3. Palette',
		'7: White',
		'7',
		() => actionColorChanged(7)
	),
];
