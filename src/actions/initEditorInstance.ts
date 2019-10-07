/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019 Martin Bórik
 */

import { Dispatch } from "redux";
import { actionAbout, actionRefresh, actionSelectionChanged, EditorAction } from "./base";
import * as Editor from "../editor/Editor";


const COLORACE_EDITOR_CONFIGURATION = 'colorace-editor-configuration';

export const actionInitEditorInstance = (dispatch: Dispatch) => {
	const editor = Editor.getInstance({
		selectCB: (nonEmpty: boolean) => dispatch(actionSelectionChanged(nonEmpty)),
		canvas: document.getElementById('drawingCanvas') as HTMLCanvasElement,
		upload: document.getElementById('uploadCanvas') as HTMLCanvasElement,
		status: document.getElementById('statusBar') as HTMLDivElement
	});

	let configuration = null;
	let doAfterConfig = (): any => dispatch(actionAbout(true));

	try {
		configuration = JSON.parse(localStorage.getItem(COLORACE_EDITOR_CONFIGURATION));

		doAfterConfig = () => {
			for (let opt in configuration) {
				editor[opt] = configuration[opt];
			}

			dispatch(actionRefresh());
		};
	} catch (e) {
		console.error('invalid ColorAceEditor configuration!');
	}

	window.addEventListener('beforeunload', e => {
		e.preventDefault();
		delete e['returnValue'];

		localStorage.setItem(COLORACE_EDITOR_CONFIGURATION, JSON.stringify({
			undoLevels: editor.undoLevels,
			zoomFactor: editor.zoomFactor,
			showGuides: editor.showGuides,
			editColor: editor.editColor,
			editTool: editor.editTool,
			editMode: editor.editMode,
			editFilled: editor.editFilled,
			editSelectFnShiftWrap: editor.editSelectFnShiftWrap,
			editSelectFnShiftAttr: editor.editSelectFnShiftAttr,
			editSelectFnBlockAttr: editor.editSelectFnBlockAttr
		}));
	});

	dispatch({
		type: EditorAction.InitEditorInstance,
		payload: editor
	});

	setTimeout(doAfterConfig, 128);
};
