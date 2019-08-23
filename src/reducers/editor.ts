/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019 Martin Bórik
 */

import { Editor } from "../editor/Editor";
import {
	INIT_EDITOR_INSTANCE,
	TOOL_CHANGED,
	DRAW_MODE_CHANGED
} from "../actions/editor";


export interface EditorReducerState {
	editor: Editor;
}

const defaultState: EditorReducerState = {
	editor: null
};

export const editorReducer = (state = defaultState, action: any) => {
	const editor: Editor = state.editor;

	switch (action.type) {
		case INIT_EDITOR_INSTANCE:
			return {
				...state,
				editor: action.payload
			};

		case TOOL_CHANGED:
			editor.editTool = action.payload.editTool;

			return {
				...state,
				editor
			};

		case DRAW_MODE_CHANGED:
			editor.editMode = action.payload.editMode;

			return {
				...state,
				editor
			};
	}

	return state;
};
