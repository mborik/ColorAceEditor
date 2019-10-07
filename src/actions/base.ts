/*
 * PMD 85 ColorAce picture editor
 * redux actions base definitions
 *
 * Copyright (c) 2019 Martin Bórik
 */

import { Dispatch } from "redux";
import { EditorTool, EditorDrawMode } from "../editor/Editor";
import { EditorReducerState } from "../reducers/editor";

export const enum EditorAction {
	InitEditorInstance = 'INIT_EDITOR_INSTANCE',
	SelectionChanged = 'SELECTION_CHANGED',
	ToolChanged = 'TOOL_CHANGED',
	ColorChanged = 'COLOR_CHANGED',
	DrawModeChanged = 'DRAW_MODE_CHANGED',
	FillShapeChanged = 'FILL_SHAPE_CHANGED',
	SelectFnCheckboxChanged = 'SELECT_FN_CHECKBOX_CHANGED',
	SelectAll = 'SELECT_ALL',
	SelectNone = 'SELECT_NONE',
	SelectClear = 'SELECT_CLEAR',
	SelectInvert = 'SELECT_INVERT',
	SelectCopy = 'SELECT_COPY',
	SelectShiftFlip = 'SELECT_SHIFTFLIP',
	ViewportRefresh = 'VIEWPORT_REFRESH',
	ViewportCleanup = 'VIEWPORT_CLEANUP',
	ViewportZoom = 'VIEWPORT_ZOOM',
	ViewportPan = 'VIEWPORT_PAN',
	ToggleGuides = 'VIEWPORT_GUIDES',
	Cancel = 'CANCEL',
	Undo = 'UNDO',
	About = 'ABOUT_DIALOG',
	Results = 'RESULTS_DIALOG',
	Toast = 'SHOW_TOAST',
	LoadFile = 'LOAD_FILE',
	SaveFile = 'SAVE_FILE'
}

export interface EditorReducerAction {
	type: EditorAction;
	payload?: any;
}

export interface EditorReducerStoreProps {
	dispatch: Dispatch;
	getState: () => EditorReducerState;
}

//---------------------------------------------------------------------------------------
export const actionSelectionChanged = (nonEmpty: boolean): EditorReducerAction => ({
	type: EditorAction.SelectionChanged,
	payload: { nonEmpty }
});

export const actionToolChanged = (editTool: EditorTool): EditorReducerAction => ({
	type: EditorAction.ToolChanged,
	payload: { editTool }
});

export const actionColorChanged = (editColor: number): EditorReducerAction => ({
	type: EditorAction.ColorChanged,
	payload: { editColor }
});

export const actionDrawModeChanged = (editMode: EditorDrawMode): EditorReducerAction => ({
	type: EditorAction.DrawModeChanged,
	payload: { editMode }
});

export const actionFillShapeChanged = (editFilled: boolean): EditorReducerAction => ({
	type: EditorAction.FillShapeChanged,
	payload: { editFilled }
});

export const actionSelectFnCheckboxChanged = (checkboxProperty: string): EditorReducerAction => ({
	type: EditorAction.SelectFnCheckboxChanged,
	payload: { checkboxProperty }
});

export const actionSelectAll = (): EditorReducerAction => ({
	type: EditorAction.SelectAll
});

export const actionSelectNone = (): EditorReducerAction => ({
	type: EditorAction.SelectNone
});

export const actionSelectClear = (resetAttrs: boolean = false): EditorReducerAction => ({
	type: EditorAction.SelectClear,
	payload: { resetAttrs }
});

export const actionSelectInvert = (): EditorReducerAction => ({
	type: EditorAction.SelectInvert
});

export const actionSelectCopy = (cut: boolean = false): EditorReducerAction => ({
	type: EditorAction.SelectCopy,
	payload: { cut }
});

export const actionViewportZoom = (zoomDelta: number): EditorReducerAction => ({
	type: EditorAction.ViewportZoom,
	payload: { zoomDelta }
});

export const actionViewportPan = (position: WebKitPoint): EditorReducerAction => ({
	type: EditorAction.ViewportPan,
	payload: { position }
});

export const actionRefresh = (): EditorReducerAction => ({
	type: EditorAction.ViewportRefresh
});

export const actionCleanup = (): EditorReducerAction => ({
	type: EditorAction.ViewportCleanup
});

export const actionToggleGuides = (): EditorReducerAction => ({
	type: EditorAction.ToggleGuides
});

export const actionCancel = (): EditorReducerAction => ({
	type: EditorAction.Cancel
});

export const actionUndo = (): EditorReducerAction => ({
	type: EditorAction.Undo
});

export const actionAbout = (open: boolean): EditorReducerAction => ({
	type: EditorAction.About,
	payload: { open }
});

export const actionResults = (open: boolean): EditorReducerAction => ({
	type: EditorAction.Results,
	payload: { open }
});

export const actionLoadFile = (): EditorReducerAction => ({
	type: EditorAction.LoadFile
});

export const actionSaveFile = (fileName?: string): EditorReducerAction => ({
	type: EditorAction.SaveFile,
	payload: { fileName }
});
