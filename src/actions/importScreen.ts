/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019 Martin Bórik
 */

import { Dispatch } from "redux";
import { actionRefresh } from "./base";
import { actionToast } from "./toast";
import { editor } from "../editor/Editor";
import { EditorReducerState } from "../reducers/editor";


export const actionImportScreen = (filename: string) =>
	(dispatch: Dispatch, getState: () => EditorReducerState) => {
		const state = getState();
		if (!(filename && state.editor)) {
			return;
		}

		fetch(filename)
			.then(response => response.arrayBuffer())
			.then(buffer => {
				editor.pixel.readPMD85vram(new Uint8Array(buffer));
				dispatch(actionRefresh());
			})
			.catch((error: string) => dispatch(actionToast({
				intent: 'danger',
				message: error
			})));
	};
