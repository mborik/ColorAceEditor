/*
 * PMD 85 ColorAce picture editor
 * Main component, drawing canvas container
 *
 * Copyright (c) 2019 Martin Bórik
 */

import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useEventListener from '@use-it/event-listener';
import { ResizeSensor, IResizeEntry } from '@blueprintjs/core';
import { actionInitEditorInstance, actionUploadFile } from '../actions/editor';
import { Editor } from '../editor/Editor';
import devLog from '../utils/logger';


const Main: React.FunctionComponent = () => {
	const dispatch = useDispatch();
	const editor = useSelector((state: any) => state.editor as Editor);

	useEffect(() => {
		devLog('initializing ColorAceEditor instance...');

		dispatch(actionInitEditorInstance({
			canvas: document.getElementById('drawingCanvas') as HTMLCanvasElement,
			upload: document.getElementById('uploadCanvas') as HTMLCanvasElement,
			grid: true,
			undo: 20
		}));
	}, [ dispatch ]);

	const handleResize = useCallback((entries: IResizeEntry[]) => {
		const entry = entries.shift();
		if (entry) {
			const rect = entry.contentRect;

			devLog('viewport dimensions set to renderer', rect);
			editor.setDimensions(rect.width, rect.height);
		}
	}, [ editor ]);

	const handleMouseWheel = useCallback(
		(e: React.WheelEvent) => editor && editor.action.mouseWheel(e),
	[ editor ]);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => editor && editor.action.mouseDown(e),
	[ editor ]);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => editor && editor.action.mouseMove(e),
	[ editor ]);

	const handleMouseUp = useCallback(
		(e: React.MouseEvent) => editor && editor.action.mouseUp(e),
	[ editor ]);

	const handleUploadFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) =>
		dispatch(actionUploadFile(e.target.files[0])),
	[ dispatch ]);

	useEventListener('contextmenu', e => e.preventDefault(), document.documentElement);
	useEventListener('mousemove', handleMouseMove, document.documentElement);
	useEventListener('mouseup', handleMouseUp, document.documentElement);

	return <>
		<ResizeSensor onResize={handleResize}>
			<main className="bp3-fill" role="main"
				onWheel={handleMouseWheel}
				onMouseDown={handleMouseDown}>

				<canvas id="drawingCanvas" />
			</main>
		</ResizeSensor>

		<form hidden encType="multipart/form-data">
			<input type="file" id="uploadFile" onChange={handleUploadFile} />
			<canvas id="uploadCanvas" />
		</form>
	</>;
}

export default Main;
