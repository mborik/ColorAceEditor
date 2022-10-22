/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2022 Martin Bórik
 */

import constants from '../constants';
import { Editor } from '../editor';
import { actionToast } from './toast';
import { actionCancel, DispatchAction, EditorAction } from '.';


export const actionSelectExport = (editor: Editor): DispatchAction => {
  if (!editor.selection.nonEmpty()) {
    return actionCancel();
  }
  if (!editor.selection.testAttrBounds()) {
    return actionToast({
      icon: 'new-grid-item',
      message: 'Selection not fit to attributes!'
    });
  }
  const { x1: x, y1: y, w, h } = editor.selection;
  return {
    type: EditorAction.SelectExport,
    payload: { fileName: constants.FILE_NAME_SPRITE, x, y, w, h }
  };
};
