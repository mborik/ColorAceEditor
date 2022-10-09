/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019-2022 Martin Bórik
 */

import constants from '../constants';
import { Editor } from '../editor';
import { PROGRESS_BAR, UPLOAD } from '../elements';
import { actionToast } from './toast';
import { actionRefresh, Dispatch } from '.';


export const actionUploadFile = ({
	dispatch,
	editor,
	file
}: {
	dispatch: Dispatch,
	editor?: Nullable<Editor>,
	file?: File,
}) => {
	if (!(file && editor)) {
		return;
	}

	const { style } = PROGRESS_BAR();
	const updateProgress = (amount: number) => {
		if (amount < 1) {
			style.display = 'block';
			style.width = Math.round(amount * 100) + 'vw';
		}
		else {
			style.display = '';
			style.width = '';
		}
	};

	editor.upload(file, updateProgress)
		.then(() => {
			setTimeout(() => {
				dispatch(actionRefresh());
			},
			constants.DEBOUNCE_TIMEOUT);
		})
		.catch((error: string) => dispatch(actionToast({
			intent: 'danger',
			message: error
		})))
		.finally(() => {
			// wipe the last loaded file to allow reopen of same file again...
			UPLOAD.INPUT().value = '';
		});
};
