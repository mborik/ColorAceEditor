/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019 Martin Bórik
 */

import { INIT_EDITOR_INSTANCE, TOOL_CHANGED } from "../actions/editor";
import { Editor } from "../editor/Editor";

export interface EditorReducerState {
	editor: Editor;
}

const defaultState: EditorReducerState = {
	editor: null
};

export const editorReducer = (state = defaultState, action: any) => {
	switch (action.type) {
		case INIT_EDITOR_INSTANCE:
			return {
				...state,
				editor: action.payload
			}

		case TOOL_CHANGED:
			const editor: Editor = state.editor;

			editor.editTool = action.payload.editTool;

			return {
				...state,
				editor
			}
	}

	return state;
};
