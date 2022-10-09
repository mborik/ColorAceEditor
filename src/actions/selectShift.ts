/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019-2022 Martin Bórik
 */

import { Editor, EditorDirection } from '../editor';
import { actionToast } from './toast';
import { DispatchAction, EditorAction } from '.';


export const actionSelectShift = (editor: Editor, direction: EditorDirection): DispatchAction => {
	if (editor.editSelectFnShiftAttr && !editor.selection.testAttrBounds()) {
		return actionToast({
			icon: 'new-grid-item',
			message: 'Selection not fit to attributes!'
		});
	}
	return {
		type: EditorAction.SelectShiftFlip,
		payload: { direction }
	};
};
