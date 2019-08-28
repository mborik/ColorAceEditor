import { getInstance as ColorAceEditor, EditorOptions, EditorTool, EditorDrawMode } from "../editor/Editor";
import { IToastProps } from "@blueprintjs/core";


export const INIT_EDITOR_INSTANCE = 'INIT_EDITOR_INSTANCE';
export const SELECTION_CHANGED = 'SELECTION_CHANGED';
export const TOOL_CHANGED = 'TOOL_CHANGED';
export const COLOR_CHANGED = 'COLOR_CHANGED';
export const DRAW_MODE_CHANGED = 'DRAW_MODE_CHANGED';
export const FILL_SHAPE_CHANGED = 'FILL_SHAPE_CHANGED';
export const SELECT_FN_CHECKBOX_CHANGED = 'SELECT_FN_CHECKBOX_CHANGED';
export const VIEWPORT_REFRESH = 'VIEWPORT_REFRESH';
export const VIEWPORT_CLEANUP = 'VIEWPORT_CLEANUP';
export const SHOW_TOAST = 'SHOW_TOAST';
export const SAVE_FILE = 'SAVE_FILE';

//---------------------------------------------------------------------------------------
export const actionInitEditorInstance = (opt: EditorOptions) => ({
	type: INIT_EDITOR_INSTANCE,
	payload: ColorAceEditor(opt)
});

export const actionSelectionChanged = (nonEmpty: boolean) => ({
	type: SELECTION_CHANGED,
	payload: { nonEmpty }
});

export const actionToolChanged = (editTool: EditorTool) => ({
	type: TOOL_CHANGED,
	payload: { editTool }
});

export const actionColorChanged = (editColor: number) => ({
	type: COLOR_CHANGED,
	payload: { editColor }
});

export const actionDrawModeChanged = (editMode: EditorDrawMode) => ({
	type: DRAW_MODE_CHANGED,
	payload: { editMode }
});

export const actionFillShapeChanged = (editFilled: boolean) => ({
	type: FILL_SHAPE_CHANGED,
	payload: { editFilled }
});

export const actionSelectFnCheckboxChanged = (checkboxProperty: string) => ({
	type: SELECT_FN_CHECKBOX_CHANGED,
	payload: { checkboxProperty }
});

export const actionRefresh = () => ({
	type: VIEWPORT_REFRESH
});

export const actionCleanup = () => ({
	type: VIEWPORT_CLEANUP
});

export const actionToast = (toastParams: IToastProps) => ({
	type: SHOW_TOAST,
	payload: {
		intent: 'warning',
		icon: 'warning-sign',
		message: 'something happen!?',
		...toastParams
	}
});

export const actionSaveFile = (fileName?: string) => ({
	type: SAVE_FILE,
	payload: { fileName }
});

export const actionUploadFile = (file: File) => (dispatch, getState) => {
	const state = getState();
	if (!(file && state.editor)) {
		return;
	}

	state.editor.upload(file)
		.then(() => dispatch(actionRefresh()))
		.catch((error: string) => dispatch(actionToast({
			message: error
		})));
};
