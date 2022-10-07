/*
 * PMD 85 ColorAce picture editor
 * BrushShape component
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import * as React from 'react';
import { Button, Classes, Dialog, Navbar, Position } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';

import constants from '../params/constants';
import { OVERLAY_WRAPPER } from '../params/querySelectors';
import { EditorTool } from '../editor/Editor';
import { useEditor } from './EditorProvider';


interface HTMLCanvasExtended extends HTMLCanvasElement {
	touched?: boolean;
	refresh: () => void;
	putPixel: (x: number, y: number, set: boolean) => void;
}

const BrushShape: React.VFC = () => {
	const { editor } = useEditor();
	const [ opened, setOpened ] = React.useState<boolean>(false);
	const [ canvas, setCanvas ] = React.useState<HTMLCanvasExtended>();

	const { pixel: editorPixelator } = editor ?? {};
	const brushSize = editorPixelator?.brush?.length ? Math.sqrt(editorPixelator.brush.length) : 0;
	const visible = (editor?.editTool === EditorTool.Brush) && editorPixelator;

	const canvasRef = React.useCallback((canvas: HTMLCanvasExtended) => {
		const canvasCtx = canvas?.getContext('2d');
		if (!editorPixelator || !canvasCtx || canvas.touched) {
			return;
		}

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
		};

		canvas.refresh = () => {
			for (let i = 0, y = 0; y < brushSize; y++) {
				for (let x = 0; x < brushSize; x++) {
					const c = editorPixelator.brush[i++];

					pixel.data.set([ c, c, c, 255 ]);
					canvasCtx.putImageData(pixel, x, y);
				}
			}
		};

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

			}
			else {
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
			<Tooltip2
				content="brush shape editor"
				position={Position.BOTTOM_RIGHT}
				portalContainer={OVERLAY_WRAPPER()}
				hoverOpenDelay={constants.TOOLTIP_TIMEOUT}>

				<Button icon='cog' onClick={() => setOpened(true)} />
			</Tooltip2>

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
						<Button
							intent="danger"
							onClick={() => {
								editorPixelator.resetBrushShape();
								canvas?.refresh();
							}}>
								Reset
						</Button>
						<Button onClick={() => setOpened(false)}>Close</Button>
					</div>
				</div>
			</Dialog>
		</Navbar.Group>
	) : null;
};

export default BrushShape;
