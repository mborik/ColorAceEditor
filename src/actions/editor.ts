import { getInstance as ColorAceEditor, EditorOptions, EditorTool, EditorDrawMode } from "../editor/Editor";


export const INIT_EDITOR_INSTANCE = 'INIT_EDITOR_INSTANCE';
export const TOOL_CHANGED = 'TOOL_CHANGED';
export const COLOR_CHANGED = 'COLOR_CHANGED';
export const DRAW_MODE_CHANGED = 'DRAW_MODE_CHANGED';
export const FILL_SHAPE_CHANGED = 'FILL_SHAPE_CHANGED';

//---------------------------------------------------------------------------------------
export const actionInitEditorInstance = (opt: EditorOptions) => {
	return {
		type: INIT_EDITOR_INSTANCE,
		payload: ColorAceEditor(opt)
	};
}

export const actionToolChanged = (editTool: EditorTool) => {
	return {
		type: TOOL_CHANGED,
		payload: { editTool }
	};
}

export const actionColorChanged = (editColor: number) => {
	return {
		type: COLOR_CHANGED,
		payload: { editColor }
	};
}

export const actionDrawModeChanged = (editMode: EditorDrawMode) => {
	return {
		type: DRAW_MODE_CHANGED,
		payload: { editMode }
	};
}

export const actionFillShapeChanged = (editFilled: boolean) => {
	return {
		type: FILL_SHAPE_CHANGED,
		payload: { editFilled }
	};
}
