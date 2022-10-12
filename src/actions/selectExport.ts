/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2022 Martin Bórik
 */

import { Editor } from '../editor';
import { actionToast } from './toast';
import { DispatchAction, EditorAction } from '.';


export const actionSelectExport = (editor: Editor, fileName?: string): DispatchAction => {
	if (!editor.selection.testAttrBounds()) {
		return actionToast({
			icon: 'new-grid-item',
			message: 'Selection not fit to attributes!'
		});
	}
	return {
		type: EditorAction.SelectExport,
		payload: { fileName }
	};
};
