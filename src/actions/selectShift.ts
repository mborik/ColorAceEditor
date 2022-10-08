/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019-2022 Martin Bórik
 */

import { DispatchAction, EditorAction } from '.';
import { actionToast } from './toast';
import { Editor, EditorDirection } from '../editor/Editor';


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
