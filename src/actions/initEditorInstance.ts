/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019-2022 Martin Bórik
 */

import { actionAbout, actionRefresh, actionSelectionChanged, Dispatch, DispatchAction, EditorAction } from './base';
import { Editor, getInstance } from '../editor/Editor';
import devLog from '../utils/logger';
import constants from '../constants';
import { CANVAS, STATUS_BAR, UPLOAD } from '../elements';


type EditorConfig = Pick<Editor,
	'undoLevels' | 'zoomFactor' | 'showGuides' | 'editColorMode' |
	'editColor' | 'editTool' | 'editMode' | 'editFilled' | 'editBrushShape' |
	'editSelectFnShiftWrap' | 'editSelectFnShiftAttr' | 'editSelectFnBlockAttr'
>

export const actionInitEditorInstance = (dispatch: Dispatch) => {
	devLog('initializing ColorAceEditor instance...');

	const editor = getInstance({
		selectCB: (nonEmpty: boolean) => dispatch(actionSelectionChanged(nonEmpty)),
		canvas: CANVAS(),
		status: STATUS_BAR(),
		upload: UPLOAD.CANVAS(),
	});

	let doActionAfterInit = (): DispatchAction => actionAbout(true);

	try {
		const configuration: EditorConfig = JSON.parse(
			localStorage.getItem(constants.EDITOR_CONFIGURATION_KEY) as string
		);

		if (configuration) {
			devLog('ColorAceEditor configuration:', configuration);
			doActionAfterInit = () => {
				for (const opt in configuration) {
					const value = configuration[opt];
					if (opt === 'editColorMode' && value) {
						editor.pixel.changeColorMode(value);
					}
					else {
						editor[opt] = value;
					}
				}
				return actionRefresh();
			};
		}
	}
	catch (_) {
		console.error('invalid ColorAceEditor configuration!');
	}

	window.addEventListener('beforeunload', event => {
		event.preventDefault();
		if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
			delete event['returnValue'];
		}
		else {
			event.returnValue = 'Unsaved changes will be lost. Are you sure?';
		}

		const {
			undoLevels, zoomFactor, showGuides, editColorMode,
			editColor, editTool, editMode, editFilled, editBrushShape,
			editSelectFnShiftWrap, editSelectFnShiftAttr, editSelectFnBlockAttr
		} = editor;

		localStorage.setItem(constants.EDITOR_CONFIGURATION_KEY, JSON.stringify({
			undoLevels, zoomFactor, showGuides, editColorMode,
			editColor, editTool, editMode, editFilled, editBrushShape,
			editSelectFnShiftWrap, editSelectFnShiftAttr, editSelectFnBlockAttr
		}));
	});

	dispatch({
		type: EditorAction.InitEditorInstance,
		payload: editor
	});

	return doActionAfterInit;
};
