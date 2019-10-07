/*
 * PMD 85 ColorAce picture editor
 * BrushShape component
 *
 * Copyright (c) 2019 Martin Bórik
 */

import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Button, Classes, Dialog, Navbar, Tooltip, Position } from "@blueprintjs/core";

import constants from '../params/constants';
import { EditorTool } from '../editor/Editor';
import { Pixelator } from '../editor/Pixelator';


interface HTMLCanvasExtended extends HTMLCanvasElement {
	touched?: boolean;
	refresh: () => void;
	putPixel: (x: number, y: number, set: boolean) => void;
}

const BrushShape: React.FunctionComponent = () => {
	const [ opened, setOpened ] = useState<boolean>(false);
	const [ canvas, setCanvas ] = useState<HTMLCanvasExtended>(null);

	const { editorPixelator, brushSize, visible } = useSelector((state: any) => {
		let editorPixelator: Pixelator = null;
		let brushSize: number = 0;
		let visible: boolean = false;

		if (state.editor) {
			const editor = state.editor;

			editorPixelator = editor.pixel;
			brushSize = Math.sqrt(editorPixelator.brush.length);
			visible = (editor.editTool === EditorTool.Brush);
		}

		return { editorPixelator, brushSize, visible };
	});

	const resetShape = useCallback(() => {
		editorPixelator.resetBrushShape();
		canvas.refresh();
	},
	[ editorPixelator, canvas ]);

	const canvasRef = useCallback((canvas: HTMLCanvasExtended) => {
		if (!canvas || canvas.touched) {
			return;
		}

		const canvasCtx = canvas.getContext('2d');
		const pixel = canvasCtx.createImageData(1, 1);

		canvas.putPixel = (x: number, y: number, set: boolean) => {
			if (x < 0 || x > brushSize || y < 0 || y > brushSize) {
				return;
			}

			const ptr = (y * brushSize) + x;
			const c = set ? 255 : 0;

			editorPixelator.brush[ptr] = c;
			pixel.data.set([ c, c, c, 255 ]);

			canvasCtx.putImageData(pixel, x, y);
		}

		canvas.refresh = () => {
			for (let i = 0, y = 0; y < brushSize; y++) {
				for (let x = 0; x < brushSize; x++) {
					const c = editorPixelator.brush[i++];

					pixel.data.set([ c, c, c, 255 ]);
					canvasCtx.putImageData(pixel, x, y);
				}
			}
		}

		const translateCoords = (sx: number, sy: number) => {
			const brushSize = Math.sqrt(editorPixelator.brush.length);
			const rect = canvas.getBoundingClientRect();
			const zoomW = rect.width / brushSize;
			const zoomH = rect.height / brushSize;

			return {
				x: Math.floor((sx - (rect.left + document.body.scrollLeft)) / zoomW),
				y: Math.floor((sy - (rect.top + document.body.scrollTop)) / zoomH)
			};
		};

		let mousePressed = 0;
		let mouseMoved = false;
		let lastX: number, lastY: number;

		canvas.addEventListener('mousedown', (e: MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (e.button === 0 || e.button === 2) {
				const { x, y } = translateCoords(e.pageX, e.pageY);

				canvas.putPixel(x, y, (e.button === 0));

				mousePressed = (e.button === 0) ? 1 : 2;
				mouseMoved = false;
				lastX = x;
				lastY = y;

			} else {
				mousePressed = 0;
			}
		});

		canvas.addEventListener('mousemove', (e: MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (mousePressed) {
				const { x, y } = translateCoords(e.pageX, e.pageY);

				if (lastX !== x || lastY !== y) {
					canvas.putPixel(x, y, (mousePressed === 1));

					lastX = x;
					lastY = y;
				}

				mouseMoved = true;
			}
		});

		canvas.addEventListener('mouseup', (e: MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (mousePressed) {
				const { x, y } = translateCoords(e.pageX, e.pageY);

				if (mouseMoved && (lastX !== x || lastY !== y)) {
					canvas.putPixel(x, y, (mousePressed === 1));
				}

				mousePressed = 0;
				mouseMoved = false;
			}
		});

		canvas.touched = true;
		canvas.refresh();

		setCanvas(canvas);
	},
	[ editorPixelator, brushSize ]);


	return visible ? (
		<Navbar.Group align="right">
			<Tooltip
				content="brush shape editor"
				position={Position.BOTTOM_RIGHT}
				hoverOpenDelay={constants.TOOLTIP_TIMEOUT}>

				<Button icon='cog' onClick={() => setOpened(true)} />
			</Tooltip>

			<Dialog
				isOpen={opened}
				autoFocus={true}
				enforceFocus={true}
				canEscapeKeyClose={false}
				canOutsideClickClose={false}
				onClose={() => setOpened(false)}
				className="brush-edit-dlg"
				icon="highlight"
				title="Brush Shape Editor">

				<div className={Classes.DIALOG_BODY}>
					<canvas ref={canvasRef} width={brushSize} height={brushSize} />
				</div>
				<div className={Classes.DIALOG_FOOTER}>
					<div className={Classes.DIALOG_FOOTER_ACTIONS}>
						<Button onClick={() => resetShape()} intent="danger">Reset</Button>
						<Button onClick={() => setOpened(false)}>Close</Button>
					</div>
				</div>
			</Dialog>
		</Navbar.Group>
	) : null;
}

export default BrushShape;
