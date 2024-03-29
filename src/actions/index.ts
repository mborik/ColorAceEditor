/*
 * PMD 85 ColorAce picture editor
 * action definitions
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import constants from '../constants';
import { EditorColorMode, EditorCoordinates, EditorDrawMode, EditorTool } from '../editor';

export const enum EditorAction {
  InitEditorInstance = 'INIT_EDITOR_INSTANCE',
  ToolChanged = 'TOOL_CHANGED',
  ColorChanged = 'COLOR_CHANGED',
  ColorModeChanged = 'COLOR_MODE_CHANGED',
  DrawModeChanged = 'DRAW_MODE_CHANGED',
  FillShapeChanged = 'FILL_SHAPE_CHANGED',
  SelectFnCheckboxChanged = 'SELECT_FN_CHECKBOX_CHANGED',
  SelectionChanged = 'SELECTION_CHANGED',
  SelectAll = 'SELECT_ALL',
  SelectNone = 'SELECT_NONE',
  SelectClear = 'SELECT_CLEAR',
  SelectInvert = 'SELECT_INVERT',
  SelectCopy = 'SELECT_COPY',
  SelectShiftFlip = 'SELECT_SHIFTFLIP',
  SelectExport = 'SELECT_EXPORT',
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
  SaveFile = 'SAVE_FILE',
  CopyToClipboard = 'COPY_TO_CLIPBOARD'
}

export interface DispatchAction {
  type: EditorAction;
  payload?: any;
}

export type Dispatch = (action: DispatchAction) => void;

//---------------------------------------------------------------------------------------
export const actionToolChanged = (editTool: EditorTool): DispatchAction => ({
  type: EditorAction.ToolChanged,
  payload: { editTool }
});

export const actionColorChanged = (editColor: number): DispatchAction => ({
  type: EditorAction.ColorChanged,
  payload: { editColor }
});

export const actionColorModeChanged = (editColorMode: EditorColorMode): DispatchAction => ({
  type: EditorAction.ColorModeChanged,
  payload: { editColorMode }
});

export const actionDrawModeChanged = (editMode: EditorDrawMode): DispatchAction => ({
  type: EditorAction.DrawModeChanged,
  payload: { editMode }
});

export const actionFillShapeChanged = (editFilled: boolean): DispatchAction => ({
  type: EditorAction.FillShapeChanged,
  payload: { editFilled }
});

export const actionSelectFnCheckboxChanged = (checkboxProperty: string): DispatchAction => ({
  type: EditorAction.SelectFnCheckboxChanged,
  payload: { checkboxProperty }
});

export const actionSelectionChanged = (): DispatchAction => ({
  type: EditorAction.SelectionChanged,
});

export const actionSelectAll = (): DispatchAction => ({
  type: EditorAction.SelectAll
});

export const actionSelectNone = (): DispatchAction => ({
  type: EditorAction.SelectNone
});

export const actionSelectClear = (resetAttrs: boolean = false): DispatchAction => ({
  type: EditorAction.SelectClear,
  payload: { resetAttrs }
});

export const actionSelectInvert = (): DispatchAction => ({
  type: EditorAction.SelectInvert
});

export const actionSelectCopy = (cut: boolean = false): DispatchAction => ({
  type: EditorAction.SelectCopy,
  payload: { cut }
});

export const actionViewportZoom = (zoomDelta: number): DispatchAction => ({
  type: EditorAction.ViewportZoom,
  payload: { zoomDelta }
});

export const actionViewportPan = (position: EditorCoordinates): DispatchAction => ({
  type: EditorAction.ViewportPan,
  payload: { position }
});

export const actionRefresh = (): DispatchAction => ({
  type: EditorAction.ViewportRefresh
});

export const actionCleanup = (): DispatchAction => ({
  type: EditorAction.ViewportCleanup
});

export const actionToggleGuides = (): DispatchAction => ({
  type: EditorAction.ToggleGuides
});

export const actionCancel = (): DispatchAction => ({
  type: EditorAction.Cancel
});

export const actionUndo = (): DispatchAction => ({
  type: EditorAction.Undo
});

export const actionAbout = (open: boolean): DispatchAction => ({
  type: EditorAction.About,
  payload: { open }
});

export const actionResults = (open: boolean): DispatchAction => ({
  type: EditorAction.Results,
  payload: { open }
});

export const actionLoadFile = (): DispatchAction => ({
  type: EditorAction.LoadFile
});

export const actionSaveFile = (
  fileName: string = constants.FILE_NAME_SCREEN
): DispatchAction => ({
  type: EditorAction.SaveFile,
  payload: { fileName }
});

export const actionCopyToClipboard = (): DispatchAction => ({
  type: EditorAction.CopyToClipboard
});
