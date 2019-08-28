/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019 Martin Bórik
 */

import { Toaster } from "@blueprintjs/core";
import { Editor } from "../editor/Editor";
import {
	INIT_EDITOR_INSTANCE,
	TOOL_CHANGED,
	COLOR_CHANGED,
	DRAW_MODE_CHANGED,
	FILL_SHAPE_CHANGED,
	SELECT_FN_CHECKBOX_CHANGED,
	VIEWPORT_REFRESH,
	VIEWPORT_CLEANUP,
	SHOW_TOAST,
	SAVE_FILE
} from "../actions/editor";


export interface EditorReducerState {
	editor: Editor;
}

const toast = Toaster.create();
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
			break;

		case COLOR_CHANGED:
			editor.editColor = action.payload.editColor;
			break;

		case DRAW_MODE_CHANGED:
			editor.editMode = action.payload.editMode;
			break;

		case FILL_SHAPE_CHANGED:
			editor.editFilled = action.payload.editFilled;
			break;

		case SELECT_FN_CHECKBOX_CHANGED: {
			const prop = action.payload.checkboxProperty;
			editor[prop] = !editor[prop];
			break;
		}

		case VIEWPORT_REFRESH:
			editor.scroller.zoomTo(editor.zoomFactor);
			break;

		case VIEWPORT_CLEANUP:
			editor.pixel.clearViewport();
			editor.scroller.zoomTo(editor.zoomFactor);
			break;

		case SHOW_TOAST:
			toast.show(action.payload);
			break;

		case SAVE_FILE:
			editor.download(action.payload.fileName);
			break;
	}

	return state;
};
