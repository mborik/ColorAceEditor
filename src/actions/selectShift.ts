/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019 Martin Bórik
 */

import { Dispatch } from "redux";
import { EditorAction } from "./base";
import { actionToast } from "./toast";
import { EditorDirection } from "../editor/Editor";
import { EditorReducerState } from "../reducers/editor";


export const actionSelectShift = (direction: EditorDirection) =>
	(dispatch: Dispatch, getState: () => EditorReducerState) => {
		const editor = getState().editor;
		if (!editor) {
			return;
		}

		if (editor.editSelectFnShiftAttr && !editor.selection.testAttrBounds()) {
			return dispatch(actionToast({
				icon: 'new-grid-item',
				message: 'Selection not fit to attributes!'
			}));
		}

		return dispatch({
			type: EditorAction.SelectShiftFlip,
			payload: { direction }
		});
	};
