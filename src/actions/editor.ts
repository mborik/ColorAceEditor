import { EditorOptions, getInstance as ColorAceEditor } from "../editor/Editor";


export const INIT_EDITOR_INSTANCE = 'INIT_EDITOR_INSTANCE';
export const TOOL_CHANGED = 'TOOL_CHANGED';

//---------------------------------------------------------------------------------------
export function initEditorInstance(opt: EditorOptions) {
	return {
		type: INIT_EDITOR_INSTANCE,
		payload: ColorAceEditor(opt)
	};
}

export function toolChanged(editTool: number) {
	return {
		type: TOOL_CHANGED,
		payload: { editTool }
	};
}
