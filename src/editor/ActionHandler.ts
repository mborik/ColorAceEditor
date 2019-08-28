/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Handler - translate mouse handlers to function by selected function
 *
 * Copyright (c) 2014-2019 Martin Bórik
 */

import React from 'react';
import { debounce } from "typescript-debounce-decorator";
import { editor, EditorTool } from "./Editor";
import { EditorSnapshot } from './Pixelator';


export class ActionHandler {
	private mouseNotMoved: boolean = true;
	private mouseBtnFlag: number = 0;
	private lastPixelX: number = 0;
	private lastPixelY: number = 0;
	private startPixelX: number = 0;
	private startPixelY: number = 0;
	private actionSnapshot: EditorSnapshot = null;

	mouseDown(e: React.MouseEvent) {
		if (e.button > 0) {
			editor.scroller.doTouchStart([{
				pageX: e.pageX,
				pageY: e.pageY
			}], e.timeStamp);

			this.mouseBtnFlag = 2;
		}
		else {
			const { x, y } = editor.translateCoords(e.pageX, e.pageY);

			switch (editor.editTool) {
				case EditorTool.Selection:
					editor.selection.reset(x, y);
					editor.scroller.zoomTo(editor.zoomFactor);
					break;

				case EditorTool.GridSelect:
					editor.selection.reset(Math.floor(x / 6) * 6, y);
					editor.scroller.zoomTo(editor.zoomFactor);
					break;

				case EditorTool.Pencil:
					editor.draw.dot(x, y);
					break;

				case EditorTool.Lines:
					// secret weapon for point selection
					if (!editor.coordsRecorder.some(v => (v.x === x && v.y === y))) {
						editor.coordsRecorder.push({ x, y });
						editor.draw.dot(x, y);
					}
					break;

				case EditorTool.Rectangle:
					this.actionSnapshot = editor.pixel.doSnapshot(true);
					break;
			}

			this.startPixelX = this.lastPixelX = x;
			this.startPixelY = this.lastPixelY = y;
			this.mouseBtnFlag = 1;
		}

		this.mouseNotMoved = true;
	}

	mouseMove(e: React.MouseEvent) {
		editor.redrawStatusBar(e.pageX, e.pageY);

		if (this.mouseBtnFlag === 0) {
			return;
		}
		else if (this.mouseBtnFlag === 2) {
			editor.scroller.doTouchMove([{
				pageX: e.pageX,
				pageY: e.pageY
			}], e.timeStamp);
		}
		else {
			const { x, y } = editor.translateCoords(e.pageX, e.pageY);

			switch (editor.editTool) {
				case EditorTool.Selection:
					if (!this.mouseNotMoved) {
						editor.pixel.redrawSelection(s => {
							s.set(s.x0, s.y0, x - 1, y - 1);
						});
					}
					break;

				case EditorTool.GridSelect:
					if (!this.mouseNotMoved) {
						editor.pixel.redrawSelection(s => {
							s.set(s.x0, s.y0, (Math.ceil(x / 6) * 6) - 1, y - 1);
						});
					}
					break;

				case EditorTool.Pencil:
					if (this.lastPixelX !== x || this.lastPixelY !== y) {
						editor.draw.line(
							this.lastPixelX,
							this.lastPixelY,
							x, y,
							this.mouseNotMoved
						);
					}
					break;

				case EditorTool.Rectangle:
					this.drawRectangle(
						this.startPixelX,
						this.startPixelY,
						x, y, editor.editFilled
					);
					break;
			}

			this.lastPixelX = x;
			this.lastPixelY = y;
		}

		this.mouseNotMoved = false;
	}

	mouseUp(e: React.MouseEvent) {
		if (this.mouseBtnFlag === 0) {
			return;
		} else if (e.button > 0) {
			editor.scroller.doTouchEnd(e.timeStamp);
		} else {
			const { x, y } = editor.translateCoords(e.pageX, e.pageY);

			switch (editor.editTool) {
				case EditorTool.Selection:
					if (!this.mouseNotMoved) {
						editor.pixel.redrawSelection(s => {
							s.set(s.x0, s.y0, x - 1, y - 1);
						});
					}

					editor.selectionActionCallback(editor.selection.nonEmpty());
					break;

				case EditorTool.GridSelect:
					if (!this.mouseNotMoved) {
						editor.pixel.redrawSelection(s => {
							s.set(s.x0, s.y0, (Math.ceil(x / 6) * 6) - 1, y - 1);
						});
					}

					editor.selectionActionCallback(editor.selection.nonEmpty());
					break;

				case EditorTool.Pencil:
					if (!this.mouseNotMoved &&
						(this.lastPixelX !== x || this.lastPixelY !== y)) {

						editor.draw.line(this.lastPixelX, this.lastPixelY, x, y, true);
					}
					break;

				case EditorTool.Rectangle:
					this.drawRectangle(
						this.startPixelX,
						this.startPixelY,
						x, y, editor.editFilled
					);
					break;
			}
		}

		this.mouseNotMoved = true;
		this.mouseBtnFlag = 0;
	}

	@debounce(16)
	mouseWheel(e: React.WheelEvent) {
		let delta = 0;
		if (e.deltaY > 0) {
			delta = -1;
		} else if (e.deltaY < 0) {
			delta = 1;
		}

		if (delta) {
			const { x, y } = editor.translateCoords(e.pageX, e.pageY);
			this.zoomViewport(delta, x, y);
		}
	}

	private drawRectangle(x1: number, y1: number, x2: number, y2: number, filled: boolean) {
		editor.pixel.undo(this.actionSnapshot);
		editor.draw.rectangle(x1, y1, x2, y2, filled);

		if (x1 > this.lastPixelX) {
			x2 = x1;
			x1 = this.lastPixelX;
		} else {
			x2 = this.lastPixelX;
		}

		if (y1 > this.lastPixelY) {
			y2 = y1;
			y1 = this.lastPixelY;
		} else {
			y2 = this.lastPixelY;
		}

		x1 = Math.floor(x1 / 6) * 6;
		x2 = Math.ceil(++x2 / 6) * 6;
		y1 = (y1 & ~1);
		y2 = (++y2 & ~1) + 2;

		editor.pixel.redrawRect(x1, y1, (x2 - x1), (y2 - y1), true);
	}

	private zoomViewport(delta: number, x: number = this.lastPixelX, y: number = this.lastPixelY) {
		const zoom = editor.zoomFactor + delta;

		if (zoom > 0 && zoom <= 16) {
			if (!editor.pixel.scalers[zoom]) {
				delta *= 2;
			}

			editor.scroller.zoomTo(
				editor.scroller.__zoomLevel + delta,
				false,
				x - editor.scroller.__clientLeft,
				y - editor.scroller.__clientTop
			);

			editor.redrawStatusBar(x, y);
		}
	}
}
