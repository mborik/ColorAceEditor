/*
 * PMD 85 ColorAce picture editor
 * Main component, drawing canvas container
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import * as React from 'react';
import { HotkeyConfig, useHotkeys } from '@blueprintjs/core';
import { ResizeSensor2, ResizeSensor2Props } from '@blueprintjs/popover2';
import useEventListener from '@use-it/event-listener';

import { actionSelectionChanged, Dispatch } from '../actions';
import { actionInitEditorInstance } from '../actions/initEditorInstance';
import { actionUploadFile } from '../actions/uploadFile';
import constants from '../constants';
import { Editor, useEditor } from '../editor';
import { HotkeyItems } from '../params/HotkeyItems';
import { devLog } from '../utils';


type InitCallbackFn = (currentDispatch: Dispatch, currentInstance: Editor) => void

const Main: React.VFC = () => {
  const { dispatch, editor } = useEditor();
  const [initCallback, setInitCallback] = React.useState<InitCallbackFn>();

  const hotkeyItems = React.useMemo(() => {
    if (editor) {
      return HotkeyItems.map(({ handler, ...hotkeyConfig }) => ({
        ...hotkeyConfig,
        onKeyDown(event) {
          const action = handler(editor, event);
          if (action) {
            dispatch(action);
          }
        },
      }) as HotkeyConfig);
    }
    return [];
  },
  [ editor ]);

  const { handleKeyDown, handleKeyUp } = useHotkeys(hotkeyItems);

  const handleResize = React.useCallback<ResizeSensor2Props['onResize']>(
    (entries) => {
      const entry = entries.shift();
      if (editor && entry) {
        const { contentRect: rect } = entry;

        devLog('viewport dimensions set to renderer', rect);
        editor.setDimensions(rect.width, rect.height);
        editor.action.zoomViewport();
      }
    },
    [ editor ]);

  const handleMouseWheel = React.useCallback(
    (e: React.WheelEvent) => editor?.action.mouseWheel(e),
    [ editor ]);

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => editor?.action.mouseDown(e),
    [ editor ]);

  const handleMouseMove = React.useCallback(
    (e: unknown) => editor?.action.mouseMove(e as React.MouseEvent),
    [ editor ]);

  const handleMouseUp = React.useCallback(
    (e: unknown) => editor?.action.mouseUp(e as React.MouseEvent),
    [ editor ]);

  const handleUploadFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) =>
    actionUploadFile({
      dispatch,
      editor,
      file: e?.target?.files?.[0]
    }),
  [ dispatch, editor ]);

  useEventListener('contextmenu', e => e.preventDefault(), document.documentElement);
  useEventListener('mousemove', handleMouseMove, document.documentElement);
  useEventListener('mouseup', handleMouseUp, document.documentElement);

  //-----------------------------------------------------------------------------------
  React.useEffect(() => {
    const doActionAfterInit = actionInitEditorInstance(dispatch);
    setTimeout(() => {
      const action = doActionAfterInit();
      setInitCallback((): InitCallbackFn =>
        (currentDispatch, currentInstance) => {
          currentInstance.selectionActionCallback = () => currentDispatch(actionSelectionChanged());
          currentDispatch(action);
        }
      );
    },
    constants.DEBOUNCE_TIMEOUT);
  }, []);

  React.useEffect(() => {
    if (typeof initCallback === 'function' && editor) {
      initCallback(dispatch, editor);
      setInitCallback(undefined);
    }
  },
  [ initCallback, dispatch ]);

  return <>
    <ResizeSensor2 onResize={handleResize}>
      <main className="bp4-fill" role="main"
        onWheel={handleMouseWheel}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}>

        <canvas id="drawingCanvas" />
      </main>
    </ResizeSensor2>

    <form hidden encType="multipart/form-data">
      <input type="file" id="uploadFile" onChange={handleUploadFile} />
      <canvas id="uploadCanvas" />
    </form>
  </>;
};

export default Main;
