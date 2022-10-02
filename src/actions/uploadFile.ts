/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019-2022 Martin Bórik
 */

import { useEditor } from "../components/EditorProvider";
import { actionRefresh } from "./base";
import { actionToast } from "./toast";


export const actionUploadFile = (file?: File) => {
	const { dispatch, editor } = useEditor();
	if (!(file && editor)) {
		return;
	}

	const { style } = document.getElementById('progress') as HTMLElement;
	const updateProgress = (amount: number) => {
		if (amount < 1) {
			style.display = 'block';
			style.width = Math.round(amount * 100) + 'vw';
		} else {
			style.display = '';
			style.width = '';
		}
	}

	editor.upload(file, updateProgress)
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
