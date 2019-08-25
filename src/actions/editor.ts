import { EditorOptions, EditorTool, getInstance as ColorAceEditor, EditorDrawMode } from "../editor/Editor";


export const INIT_EDITOR_INSTANCE = 'INIT_EDITOR_INSTANCE';
export const TOOL_CHANGED = 'TOOL_CHANGED';
export const DRAW_MODE_CHANGED = 'DRAW_MODE_CHANGED';
export const FILL_SHAPE_CHANGED = 'FILL_SHAPE_CHANGED';

//---------------------------------------------------------------------------------------
export function initEditorInstance(opt: EditorOptions) {
	return {
		type: INIT_EDITOR_INSTANCE,
		payload: ColorAceEditor(opt)
	};
}

export function toolChanged(editTool: EditorTool) {
	return {
		type: TOOL_CHANGED,
		payload: { editTool }
	};
}

export function drawModeChanged(editMode: EditorDrawMode) {
	return {
		type: DRAW_MODE_CHANGED,
		payload: { editMode }
	};
}

export function fillShapeChanged(editFilled: boolean) {
	return {
		type: FILL_SHAPE_CHANGED,
		payload: { editFilled }
	};
}
