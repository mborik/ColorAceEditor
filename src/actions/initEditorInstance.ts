/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019-2022 Martin Bórik
 */

import { actionAbout, actionRefresh, actionSelectionChanged, Dispatch, EditorAction } from "./base";
import { Editor, getInstance } from "../editor/Editor";
import devLog from '../utils/logger';


const COLORACE_EDITOR_CONFIGURATION = 'colorace-editor-configuration';

type EditorConfig = Pick<Editor,
	"undoLevels" | "zoomFactor" | "showGuides" |
	"editColor" | "editTool" | "editMode" | "editFilled" | "editBrushShape" |
	"editSelectFnShiftWrap" | "editSelectFnShiftAttr" | "editSelectFnBlockAttr"
>

export const actionInitEditorInstance = (dispatch: Dispatch) => {
	devLog('initializing ColorAceEditor instance...');

	const editor = getInstance({
		selectCB: (nonEmpty: boolean) => dispatch(actionSelectionChanged(nonEmpty)),
		canvas: document.getElementById('drawingCanvas') as HTMLCanvasElement,
		upload: document.getElementById('uploadCanvas') as HTMLCanvasElement,
		status: document.getElementById('statusBar') as HTMLDivElement
	});

	let doAfterConfig = (): any => dispatch(actionAbout(true));

	try {
		const configuration: EditorConfig = JSON.parse(
			localStorage.getItem(COLORACE_EDITOR_CONFIGURATION) as string
		);

		if (configuration) {
			devLog('ColorAceEditor configuration:', configuration);
			doAfterConfig = () => {
				for (let opt in configuration) {
					editor[opt] = configuration[opt];
				}

				dispatch(actionRefresh());
			};
		}
	} catch (_) {
		console.error('invalid ColorAceEditor configuration!');
	}

	window.addEventListener('beforeunload', event => {
		event.preventDefault();
		if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
			delete event['returnValue'];
		} else {
			event.returnValue = 'Unsaved changes will be lost. Are you sure?';
		}

		const {
			undoLevels, zoomFactor, showGuides,
			editColor, editTool, editMode, editFilled, editBrushShape,
			editSelectFnShiftWrap, editSelectFnShiftAttr, editSelectFnBlockAttr
		} = editor;

		localStorage.setItem(COLORACE_EDITOR_CONFIGURATION, JSON.stringify({
			undoLevels, zoomFactor, showGuides,
			editColor, editTool, editMode, editFilled, editBrushShape,
			editSelectFnShiftWrap, editSelectFnShiftAttr, editSelectFnBlockAttr
		}));
	});

	dispatch({
		type: EditorAction.InitEditorInstance,
		payload: editor
	});

	setTimeout(doAfterConfig, 256);
};
