/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019 Martin Bórik
 */

import { Toaster } from "@blueprintjs/core";
import { Editor } from "../editor/Editor";
import { EditorAction } from "../actions/editor";


export interface EditorReducerState {
	editor: Editor;
}


const toast = Toaster.create();
const defaultState: EditorReducerState = {
	editor: null
};

export const editorReducer = (state = defaultState, action: any): EditorReducerState => {
	const editor: Editor = state.editor;
	const noActionInProgress = !(editor && editor.action.isActionInProgress());

	switch (action.type) {
		case EditorAction.InitEditorInstance:
			return {
				...state,
				editor: action.payload
			};

		case EditorAction.ToolChanged:
			if (noActionInProgress) {
				editor.editTool = action.payload.editTool;
			}
			break;

		case EditorAction.ColorChanged:
			if (noActionInProgress) {
				editor.editColor = action.payload.editColor;
			}
			break;

		case EditorAction.DrawModeChanged:
			editor.editMode = action.payload.editMode;
			editor.action.doAfterModeChanged();
			break;

		case EditorAction.FillShapeChanged:
			editor.editFilled = action.payload.editFilled;
			break;

		case EditorAction.SelectFnCheckboxChanged: {
			const prop = action.payload.checkboxProperty;
			editor[prop] = !editor[prop];
			break;
		}

		case EditorAction.SelectAll: {
			if (noActionInProgress) {
				editor.selection.set(0, 0, 287, 255);
				editor.refresh();
			}
			break;
		}

		case EditorAction.SelectNone: {
			if (noActionInProgress && editor.selection.nonEmpty()) {
				editor.selection.reset();
				editor.refresh();
			}
			break;
		}

		case EditorAction.SelectClear:
			editor.action.fillSelection(action.payload.resetAttrs);
			break;

		case EditorAction.SelectInvert:
			editor.action.fillSelection(false, true);
			break;

		case EditorAction.SelectCopy:
			editor.action.createSnippet(action.payload.cut);
			break;

		case EditorAction.SelectShiftFlip:
			if (noActionInProgress) {
				editor.action.shiftFlipSelection(action.payload.direction);
			}
			break;

		case EditorAction.ViewportRefresh:
			editor.refresh();
			break;

		case EditorAction.ViewportCleanup: {
			editor.pixel.clearViewport();
			editor.refresh();
			break;
		}

		case EditorAction.ViewportZoom:
			editor.action.zoomViewport(action.payload.zoomDelta);
			break;

		case EditorAction.ViewportPan: {
			editor.scroller.scrollBy(
				action.payload.position.x,
				action.payload.position.y
			);
			break;
		}

		case EditorAction.Cancel:
			editor.action.cancel();
			break;

		case EditorAction.Undo: {
			if (noActionInProgress && editor.pixel.undo()) {
				editor.refresh();
			}
			break;
		}

		case EditorAction.Toast:
			toast.clear();
			toast.show(action.payload);
			break;

		case EditorAction.LoadFile:
			(document.getElementById('uploadFile') as HTMLInputElement).click();
			break;

		case EditorAction.SaveFile:
			editor.download(action.payload.fileName);
			break;
	}

	return state;
};
