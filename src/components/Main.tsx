/*
 * PMD 85 ColorAce picture editor
 * Main component, drawing canvas container
 *
 * Copyright (c) 2019 Martin Bórik
 */

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initEditorInstance } from '../actions/editor';

const Main: React.FunctionComponent = () => {
	const dispatch = useDispatch();

	useEffect(() => {
		console.log('initializing ColorAceEditor instance...');

		dispatch(initEditorInstance({
			canvas: document.getElementById('drawingCanvas') as HTMLCanvasElement,
			grid: true,
			undo: 20
		}));
	}, [ dispatch ]);

	return (
		<main className="bp3-fill" role="main">
			<canvas id="drawingCanvas"></canvas>
		</main>
	);
}

export default Main;
