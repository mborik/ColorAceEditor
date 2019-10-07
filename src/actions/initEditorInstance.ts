/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019 Martin Bórik
 */

import pick from "object.pick";
import { Dispatch } from "redux";
import { actionAbout, actionRefresh, actionSelectionChanged, EditorAction } from "./base";
import * as Editor from "../editor/Editor";
import devLog from '../utils/logger';


const COLORACE_EDITOR_CONFIGURATION = 'colorace-editor-configuration';

export const actionInitEditorInstance = (dispatch: Dispatch) => {
	devLog('initializing ColorAceEditor instance...');

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

		if (configuration) {
			devLog('ColorAceEditor configuration:', configuration);
			doAfterConfig = () => {
				for (let opt in configuration) {
					editor[opt] = configuration[opt];
				}

				dispatch(actionRefresh());
			};
		}
	} catch (e) {
		console.error('invalid ColorAceEditor configuration!');
	}

	window.addEventListener('beforeunload', e => {
		e.preventDefault();
		if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
			delete e['returnValue'];
		} else {
			e.returnValue = 'Unsaved changes will be lost. Are you sure?';
		}

		const conf = pick(editor, [
			'undoLevels', 'zoomFactor', 'showGuides',
			'editColor', 'editTool', 'editMode', 'editFilled', 'editBrushShape',
			'editSelectFnShiftWrap', 'editSelectFnShiftAttr', 'editSelectFnBlockAttr'
		]);

		localStorage.setItem(COLORACE_EDITOR_CONFIGURATION, JSON.stringify(conf));
	});

	dispatch({
		type: EditorAction.InitEditorInstance,
		payload: editor
	});

	setTimeout(doAfterConfig, 256);
};
