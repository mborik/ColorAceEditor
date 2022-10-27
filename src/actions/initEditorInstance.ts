/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019-2022 Martin Bórik
 */

import pako from 'pako';
import constants from '../constants';
import { Editor, getInstance } from '../editor';
import { devLog } from '../utils';
import {
  actionAbout,
  actionRefresh,
  Dispatch,
  DispatchAction,
  EditorAction
} from '.';


type EditorConfig = Pick<Editor,
  'undoLevels' | 'zoomFactor' | 'showGuides' | 'editColorMode' |
  'editColor' | 'editTool' | 'editMode' | 'editFilled' | 'editBrushShape' |
  'editSelectFnShiftWrap' | 'editSelectFnShiftAttr' | 'editSelectFnBlockAttr'
>

export const actionInitEditorInstance = (dispatch: Dispatch) => {
  devLog('initializing ColorAceEditor instance...');

  const editor = getInstance();
  let doActionAfterInit = (): DispatchAction => actionAbout(true);

  try {
    const configuration: EditorConfig = JSON.parse(
      localStorage.getItem(constants.EDITOR_CONFIGURATION_KEY) as string
    );

    let imageData: Optional<Uint8Array>;
    const storedBase64 = localStorage.getItem(constants.EDITOR_IMAGE_KEY);
    if (storedBase64) {
      imageData = pako.inflate(
        Uint8Array.from(
          atob(storedBase64)
            .split('')
            .map(c => c.charCodeAt(0))
        )
      );
    }

    if (configuration) {
      devLog('ColorAceEditor configuration:', configuration);
      doActionAfterInit = () => {
        for (const opt in configuration) {
          const value = configuration[opt];
          if (opt === 'editColorMode' && value) {
            editor.pixel.changeColorMode(value);
          }
          else {
            editor[opt] = value;
          }
        }
        if (imageData instanceof Uint8Array) {
          editor.pixel.readPMD85vram(imageData);
        }
        return actionRefresh();
      };
    }
  }
  catch (_) {
    console.error('invalid ColorAceEditor configuration!');
  }

  window.addEventListener('beforeunload', event => {
    event.preventDefault();
    delete event['returnValue'];

    const {
      undoLevels, zoomFactor, showGuides, editColorMode,
      editColor, editTool, editMode, editFilled, editBrushShape,
      editSelectFnShiftWrap, editSelectFnShiftAttr, editSelectFnBlockAttr
    } = editor;

    localStorage.setItem(constants.EDITOR_CONFIGURATION_KEY, JSON.stringify({
      undoLevels, zoomFactor, showGuides, editColorMode,
      editColor, editTool, editMode, editFilled, editBrushShape,
      editSelectFnShiftWrap, editSelectFnShiftAttr, editSelectFnBlockAttr
    }));

    const imageData = editor.pixel.preparePMD85vram();
    const base64 = btoa(String.fromCharCode.apply(null, pako.deflate(imageData)));
    localStorage.setItem(constants.EDITOR_IMAGE_KEY, base64);
  });

  dispatch({
    type: EditorAction.InitEditorInstance,
    payload: editor
  });

  return doActionAfterInit;
};
