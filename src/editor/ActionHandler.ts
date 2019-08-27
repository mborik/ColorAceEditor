/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Handler - translate mouse handlers to function by selected function
 *
 * Copyright (c) 2014-2019 Martin Bórik
 */

import React from 'react';
import { debounce } from "typescript-debounce-decorator";
import { editor, EditorTool } from "./Editor";


export interface MouseMoveEvent extends MouseEvent {
	lastXCoord: number;
	lastYCoord: number;
	notMoved: boolean;
}

export class ActionHandler {
	private mouseNotMoved: boolean = true;
	private mouseBtnFlag: number = 0;
	private lastPixelX: number = 0;
	private lastPixelY: number = 0;

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

				case EditorTool.Brush:
					editor.draw.dot(x, y);

					// secret weapon for point selection
					if (!editor.coordsRecorder.some(v => (v.x === x && v.y === y))) {
						editor.coordsRecorder.push({ x, y });
					}
					break;
			}

			this.lastPixelX = x;
			this.lastPixelY = y;
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

	zoomViewport(delta: number, x: number = this.lastPixelX, y: number = this.lastPixelY) {
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
