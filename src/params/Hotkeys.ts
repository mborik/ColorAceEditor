/*
 * PMD 85 ColorAce picture editor
 * Hotkey definitions & actions
 *
 * Copyright (c) 2019 Martin Bórik
 */

import { IHotkeyProps } from "@blueprintjs/core";
import { Editor, EditorTool, EditorDrawMode } from "../editor/Editor";
import { EditorReducerAction } from "../actions/editor";
import {
	actionToolChanged,
	actionDrawModeChanged,
	actionColorChanged,
	actionFillShapeChanged,
	actionSelectAll,
	actionSelectNone,
	actionSelectClear,
	actionViewportZoom,
	actionViewportPan,
	actionCancel,
	actionUndo,
	actionLoadFile,
	actionSaveFile
} from "../actions/editor";


const isSelection = (editor: Editor) => (
	editor.editTool === EditorTool.Selection ||
	editor.editTool === EditorTool.GridSelect
);

export type HotkeyItemAction = (editor: Editor, e: KeyboardEvent) => EditorReducerAction;

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
		'1. Viewport',
		'Zoom In',
		'mod+=',
		() => actionViewportZoom(1)
	),
	new HotkeyItem(
		'1. Viewport',
		'Zoom Out',
		'mod+-',
		() => actionViewportZoom(-1)
	),
	new HotkeyItem(
		'1. Viewport',
		'Zoom to 100%',
		'mod+0',
		editor => actionViewportZoom(~editor.zoomFactor + 2)
	),
	new HotkeyItem(
		'1. Viewport',
		'Scroll Up',
		'up',
		editor => editor.zoomFactor > 2 ? actionViewportPan({ x: 0, y: -editor.zoomFactor * 2 }) : null
	),
	new HotkeyItem(
		'1. Viewport',
		'Scroll Left',
		'left',
		editor => editor.zoomFactor > 2 ? actionViewportPan({ x: -editor.zoomFactor * 6, y: 0 }) : null
	),
	new HotkeyItem(
		'1. Viewport',
		'Scroll Right',
		'right',
		editor => editor.zoomFactor > 2 ? actionViewportPan({ x: editor.zoomFactor * 6, y: 0 }) : null
	),
	new HotkeyItem(
		'1. Viewport',
		'Scroll Down',
		'down',
		editor => editor.zoomFactor > 2 ? actionViewportPan({ x: 0, y: editor.zoomFactor * 2 }) : null
	),
	new HotkeyItem(
		'2. Tools',
		'Selection',
		'S',
		() => actionToolChanged(EditorTool.Selection)
	),
	new HotkeyItem(
		'2. Tools',
		'Attribute selection',
		'A',
		() => actionToolChanged(EditorTool.GridSelect)
	),
	new HotkeyItem(
		'2. Tools',
		'Pencil',
		'P',
		() => actionToolChanged(EditorTool.Pencil)
	),
	new HotkeyItem(
		'2. Tools',
		'Brush',
		'B',
		() => actionToolChanged(EditorTool.Brush)
	),
	new HotkeyItem(
		'2. Tools',
		'Lines',
		'L',
		() => actionToolChanged(EditorTool.Lines)
	),
	new HotkeyItem(
		'2. Tools',
		'Ellipse',
		'E',
		() => actionToolChanged(EditorTool.Ellipse)
	),
	new HotkeyItem(
		'2. Tools',
		'Rectangle',
		'R',
		() => actionToolChanged(EditorTool.Rectangle)
	),
	new HotkeyItem(
		'2. Tools',
		'Point Coords Recorder',
		'mod+P',
		() => actionToolChanged(EditorTool.Recorder)
	),
	new HotkeyItem(
		'3. Draw mode',
		'Over',
		'Z',
		editor => isSelection(editor) ? null :
			actionDrawModeChanged(EditorDrawMode.Over)
	),
	new HotkeyItem(
		'3. Draw mode',
		'Set / Reset',
		'X',
		editor => isSelection(editor) ? null :
			actionDrawModeChanged((editor.editMode === EditorDrawMode.Set ?
				EditorDrawMode.Reset : EditorDrawMode.Set))
	),
	new HotkeyItem(
		'3. Draw mode',
		'Colorize',
		'C',
		editor => isSelection(editor) ? null :
			actionDrawModeChanged(EditorDrawMode.Color)
	),
	new HotkeyItem(
		'3. Draw mode',
		'Filled shape',
		'V',
		editor => (
			editor.editTool === EditorTool.Ellipse ||
			editor.editTool === EditorTool.Rectangle
		) ? actionFillShapeChanged(!editor.editFilled) : null
	),
	new HotkeyItem(
		'4. Palette',
		'0: No color (attrs not modified)',
		'D',
		() => actionColorChanged(0)
	),
	new HotkeyItem(
		'4. Palette',
		'1: Red',
		'1',
		() => actionColorChanged(1)
	),
	new HotkeyItem(
		'4. Palette',
		'2: Blue',
		'2',
		() => actionColorChanged(2)
	),
	new HotkeyItem(
		'4. Palette',
		'3: Fuchsia',
		'3',
		() => actionColorChanged(3)
	),
	new HotkeyItem(
		'4. Palette',
		'4: Green',
		'4',
		() => actionColorChanged(4)
	),
	new HotkeyItem(
		'4. Palette',
		'5: Cyan',
		'5',
		() => actionColorChanged(5)
	),
	new HotkeyItem(
		'4. Palette',
		'6: Yellow',
		'6',
		() => actionColorChanged(6)
	),
	new HotkeyItem(
		'4. Palette',
		'7: White',
		'7',
		() => actionColorChanged(7)
	),
	new HotkeyItem(
		'5. Selection',
		'Select all',
		'mod+A',
		() => actionSelectAll()
	),
	new HotkeyItem(
		'5. Selection',
		'Deselect',
		'mod+D',
		() => actionSelectNone()
	),
	new HotkeyItem(
		'5. Selection',
		'Cut & Place',
		'mod+X',
		() => null
	),
	new HotkeyItem(
		'5. Selection',
		'Clone',
		'mod+C',
		() => null
	),
	new HotkeyItem(
		'5. Selection',
		'Clear pixels',
		'del',
		() => actionSelectClear()
	),
	new HotkeyItem(
		'5. Selection',
		'Clear also attributes',
		'mod+del',
		() => actionSelectClear(true)
	),
	new HotkeyItem(
		'5. Selection',
		'Invert',
		'mod+I',
		() => null
	),
	new HotkeyItem(
		'5. Selection',
		'Shift Up',
		'mod+up',
		() => null
	),
	new HotkeyItem(
		'5. Selection',
		'Shift Left',
		'mod+left',
		() => null
	),
	new HotkeyItem(
		'5. Selection',
		'Shift Right',
		'mod+right',
		() => null
	),
	new HotkeyItem(
		'5. Selection',
		'Shift Down',
		'mod+down',
		() => null
	),
	new HotkeyItem(
		'6. Operations',
		'Undo',
		'mod+Z',
		() => actionUndo()
	),
	new HotkeyItem(
		'6. Operations',
		'Convert bitmap image or Load screen-dump',
		'mod+O',
		() => actionLoadFile()
	),
	new HotkeyItem(
		'6. Operations',
		'Save screen-dump',
		'mod+S',
		() => actionSaveFile()
	),
	new HotkeyItem(
		'6. Operations',
		'Cancel current operation',
		'escape',
		() => actionCancel()
	)
];
