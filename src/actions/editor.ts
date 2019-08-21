import * as ColorAceEditor from "../editor/Editor";


export const INIT_EDITOR_INSTANCE = 'INIT_EDITOR_INSTANCE';

export function initEditorInstance(opt: ColorAceEditor.EditorOptions) {
	return {
		type: INIT_EDITOR_INSTANCE,
		payload: ColorAceEditor.getInstance(opt)
	}
}
