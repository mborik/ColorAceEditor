/*
 * PMD 85 ColorAce picture editor
 * Main component, drawing canvas container
 *
 * Copyright (c) 2019 Martin Bórik
 */

import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ResizeSensor, IResizeEntry } from '@blueprintjs/core';
import { initEditorInstance } from '../actions/editor';
import { Editor } from '../editor/Editor';


const dev: boolean = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development');

const Main: React.FunctionComponent = () => {
	const dispatch = useDispatch();
	const editor = useSelector((state: any) => state.editor as Editor);

	useEffect(() => {
		if (dev) {
			console.log('initializing ColorAceEditor instance...');
		}

		dispatch(initEditorInstance({
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

			if (dev) {
				console.log('viewport dimensions set to renderer', rect);
			}

			editor.setDimensions(rect.width, rect.height);
		}
	}, [ editor ]);

	const handleMouseWheel = useCallback((e: React.WheelEvent) => {
		let delta = (e.deltaY > 0 ? -1 : 1);

		const scrl = editor.scroller;
		const zoom = editor.zoomFactor + delta;

		if (zoom > 0 && zoom <= 16) {
			if (!editor.pixel.scalers[zoom]) {
				delta *= 2;
			}

			scrl.zoomTo(
				scrl.__zoomLevel + delta,
				false,
				e.pageX - scrl.__clientLeft,
				e.pageY - scrl.__clientTop
			);

			editor.redrawStatusBar(e.pageX, e.pageY);
		}
	}, [ editor ]);

	return <>
		<ResizeSensor onResize={handleResize}>
			<main className="bp3-fill" role="main"
				onWheel={handleMouseWheel}>

				<canvas id="drawingCanvas" />
			</main>
		</ResizeSensor>

		<output hidden>
			<canvas id="uploadCanvas" />
		</output>
	</>;
}

export default Main;
