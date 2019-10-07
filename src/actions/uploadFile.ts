/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019 Martin Bórik
 */

import { Dispatch } from "redux";
import { actionRefresh } from "./base";
import { actionToast } from "./toast";
import { EditorReducerState } from "../reducers/editor";


export const actionUploadFile = (file: File) =>
	(dispatch: Dispatch, getState: () => EditorReducerState) => {
		const state = getState();
		if (!(file && state.editor)) {
			return;
		}

		const progressEl = document.getElementById('progress') as HTMLElement;
		const updateProgress = (amount: number) => {
			if (amount < 1) {
				progressEl.style.display = 'block';
				progressEl.style.width = Math.round(amount * 100) + 'vw';
			} else {
				progressEl.style.display = null;
				progressEl.style.width = null;
			}
		}

		state.editor.upload(file, updateProgress)
			.then(() => dispatch(actionRefresh()))
			.catch((error: string) => dispatch(actionToast({
				intent: 'danger',
				message: error
			})))
			.finally(() => {
				// wipe the last loaded file to allow reopen of same file again...
				(document.getElementById('uploadFile') as any).value = null;
			});
	};
