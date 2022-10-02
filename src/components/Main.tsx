/*
 * PMD 85 ColorAce picture editor
 * Main component, drawing canvas container
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import React, { useEffect, useCallback } from 'react';
import { ResizeEntry } from '@blueprintjs/core';
import { ResizeSensor2 } from '@blueprintjs/popover2';
import useEventListener from '@use-it/event-listener';
import devLog from '../utils/logger';

import { useEditor } from './EditorProvider';
import { actionInitEditorInstance } from '../actions/initEditorInstance';
import { actionUploadFile } from "../actions/uploadFile";


const Main: React.VFC = () => {
	const { dispatch, editor } = useEditor();

	const handleResize = useCallback((entries: ResizeEntry[]) => {
		const entry = entries.shift();
		if (editor && entry) {
			const { contentRect: rect } = entry;

			devLog('viewport dimensions set to renderer', rect);
			editor.setDimensions(rect.width, rect.height);
			editor.action.zoomViewport();
		}
	},
	[ editor ]);

	const handleMouseWheel = useCallback(
		(e: React.WheelEvent) => editor?.action.mouseWheel(e),
	[ editor ]);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => editor?.action.mouseDown(e),
	[ editor ]);

	const handleMouseMove = useCallback(
		(e: unknown) => editor?.action.mouseMove(e as React.MouseEvent),
	[ editor ]);

	const handleMouseUp = useCallback(
		(e: unknown) => editor?.action.mouseUp(e as React.MouseEvent),
	[ editor ]);

	const handleUploadFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) =>
		actionUploadFile(e?.target?.files?.[0]),
	[ dispatch ]);

	useEventListener('contextmenu', e => e.preventDefault(), document.documentElement);
	useEventListener('mousemove', handleMouseMove, document.documentElement);
	useEventListener('mouseup', handleMouseUp, document.documentElement);

	//-----------------------------------------------------------------------------------
	useEffect(() => actionInitEditorInstance(dispatch), [ dispatch ]);


	return <>
		<ResizeSensor2 onResize={handleResize}>
			<main className="bp4-fill" role="main"
				onWheel={handleMouseWheel}
				onMouseDown={handleMouseDown}>

				<canvas id="drawingCanvas" />
			</main>
		</ResizeSensor2>

		<form hidden encType="multipart/form-data">
			<input type="file" id="uploadFile" onChange={handleUploadFile} />
			<canvas id="uploadCanvas" />
		</form>
	</>;
}

export default Main;
