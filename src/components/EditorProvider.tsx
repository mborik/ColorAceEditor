/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019-2022 Martin Bórik
 */

import * as React from 'react';
import { Editor } from '../editor/Editor';
import { EditorAction, DispatchAction, Dispatch } from '../actions';
import { showToast } from '../actions/toast';
import { UPLOAD } from '../elements';
import devLog from '../utils/logger';


export interface EditorContextState {
	aboutDialogOpen: boolean;
	coordsResultsDialogOpen: boolean;
	editor: Nullable<Editor>;
}

interface EditorContext extends EditorContextState {
	dispatch: Dispatch;
}

const defaultState = {
	aboutDialogOpen: false,
	coordsResultsDialogOpen: false,
} as EditorContextState;

const Context = React.createContext<EditorContext>(defaultState as EditorContext);

const EditorProvider = ({ children }) => {
	const [state, setState] = React.useState<EditorContextState>(defaultState);

	const withRender = () => setState((prevState) => ({ ...prevState }));
	const dispatch = React.useCallback(({ type, payload }: DispatchAction) => {
		const { editor } = state;
		if (!editor) {
			if (type === EditorAction.InitEditorInstance) {
				return setState((prevState) => ({
					...prevState,
					editor: payload
				}));
			}
			return;
		}

		devLog(type, payload ?? '');
		const { action } = editor;

		switch (type) {
			case EditorAction.ToolChanged:
				if (!action.isActionInProgress()) {
					editor.editTool = payload.editTool;
					return withRender();
				}
				break;

			case EditorAction.ColorChanged:
				if (!action.isActionInProgress()) {
					editor.editColor = payload.editColor;
					return withRender();
				}
				break;

			case EditorAction.ColorModeChanged:
				editor.pixel.refreshAttrs(payload.editColorMode);
				editor.refresh();
				return withRender();

			case EditorAction.DrawModeChanged:
				editor.editMode = payload.editMode;
				action.doAfterModeChanged();
				return withRender();

			case EditorAction.FillShapeChanged:
				editor.editFilled = payload.editFilled;
				return withRender();

			case EditorAction.SelectFnCheckboxChanged:
				const prop = payload.checkboxProperty;
				editor[prop] = !editor[prop];
				return withRender();

			case EditorAction.SelectAll:
				if (!action.isActionInProgress()) {
					editor.selection.set(0, 0, 287, 255);
					editor.refresh();
				}
				break;

			case EditorAction.SelectNone:
				if (!action.isActionInProgress() && editor.selection.nonEmpty()) {
					editor.selection.reset();
					editor.refresh();
				}
				break;

			case EditorAction.SelectClear:
				action.fillSelection(payload.resetAttrs);
				break;

			case EditorAction.SelectInvert:
				action.fillSelection(false, true);
				break;

			case EditorAction.SelectCopy:
				action.createSnippet(payload.cut);
				break;

			case EditorAction.SelectShiftFlip:
				if (!action.isActionInProgress()) {
					action.shiftFlipSelection(payload.direction);
				}
				break;

			case EditorAction.ViewportRefresh:
				editor.refresh();
				return withRender();

			case EditorAction.ViewportCleanup:
				editor.pixel.clearViewport();
				editor.refresh();
				break;

			case EditorAction.ToggleGuides:
				editor.showGuides = !editor.showGuides;
				editor.refresh();
				return withRender();

			case EditorAction.ViewportZoom:
				action.zoomViewport(payload.zoomDelta);
				break;

			case EditorAction.ViewportPan:
				editor.scroller.scrollBy(
					payload.position.x,
					payload.position.y
				);
				break;

			case EditorAction.Cancel:
				action.cancel();
				break;

			case EditorAction.Undo:
				if (!action.isActionInProgress() && editor.pixel.undo()) {
					editor.refresh();
				}
				break;

			case EditorAction.About:
				return setState((prevState) => ({
					...prevState,
					aboutDialogOpen: payload.open
				}));

			case EditorAction.Results:
				return setState((prevState) => ({
					...prevState,
					coordsResultsDialogOpen: payload.open
				}));

			case EditorAction.Toast:
				showToast(payload);
				break;

			case EditorAction.LoadFile:
				UPLOAD.INPUT().click();
				break;

			case EditorAction.SaveFile:
				editor.download(payload.fileName);
				break;
		}
	},
	[ state.editor ]);

	return <Context.Provider value={{ ...state, dispatch }}>{children}</Context.Provider>;
};

export const useEditor = () => React.useContext(Context);

export default EditorProvider;
