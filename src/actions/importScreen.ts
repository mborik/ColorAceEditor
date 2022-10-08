/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019-2022 Martin Bórik
 */

import { actionRefresh, Dispatch } from './base';
import { actionToast } from './toast';
import { Editor } from '../editor/Editor';
import constants from '../constants';


export const actionImportScreen = ({
	dispatch,
	editor,
	fileName
}: {
	dispatch: Dispatch,
	editor?: Nullable<Editor>,
	fileName: string,
}) => {
	if (!(fileName && editor)) {
		return;
	}

	fetch(fileName)
		.then(response => response.arrayBuffer())
		.then(buffer => {
			editor.pixel.readPMD85vram(new Uint8Array(buffer));
			setTimeout(() => {
				dispatch(actionRefresh());
			},
			constants.DEBOUNCE_TIMEOUT);
		})
		.catch((error: string) => dispatch(actionToast({
			intent: 'danger',
			message: error
		})));
};
