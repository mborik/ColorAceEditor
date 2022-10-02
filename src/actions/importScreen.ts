/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019-2022 Martin Bórik
 */

import { actionRefresh } from "./base";
import { actionToast } from "./toast";
import { useEditor } from "../components/EditorProvider";


export const actionImportScreen = (filename: string) => {
	const { dispatch, editor } = useEditor();
	if (!(filename && editor)) {
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
