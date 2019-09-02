/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Handler - translate mouse handlers to function by selected function
 *
 * Copyright (c) 2014-2019 Martin Bórik
 */

import React from 'react';
import { debounce } from "typescript-debounce-decorator";
import { editor, EditorTool, EditorDrawMode } from "./Editor";
import { EditorSnapshot, EditorSnippet } from './Pixelator';


export class ActionHandler {
	private mouseNotMoved: boolean = true;
	private mouseBtnFlag: number = 0;
	private lastPixelX: number = 0;
	private lastPixelY: number = 0;
	private startPixelX: number = 0;
	private startPixelY: number = 0;
	private activeSnippet: EditorSnippet = null;
	private actionSnapshot: EditorSnapshot = null;

	/**
	 * Handler of `mousedown` event.
	 *
	 * @param {React.MouseEvent} e
	 */
	mouseDown(e: React.MouseEvent) {
		if (e.button > 0) {
			editor.scroller.doTouchStart([{
				pageX: e.pageX,
				pageY: e.pageY
			}], e.timeStamp);

			this.mouseBtnFlag = 2;

		} else if (this.activeSnippet != null) {
			this.mouseBtnFlag = 1;
			return;

		} else {
			const { x, y } = editor.translateCoords(e.pageX, e.pageY);

			switch (editor.editTool) {
				case EditorTool.Selection: {
					editor.selection.reset(x, y);
					editor.refresh();
					break;
				}
				case EditorTool.GridSelect: {
					editor.selection.reset(Math.floor(x / 6) * 6, y);
					editor.refresh();
					break;
				}
				case EditorTool.Pencil:
				case EditorTool.Lines: {
					this.actionSnapshot = editor.pixel.doSnapshot();
					editor.draw.dot(x, y);
					break;
				}
				case EditorTool.Ellipse:
				case EditorTool.Rectangle:
					this.actionSnapshot = editor.pixel.doSnapshot();
					break;

				case EditorTool.Recorder: {
					// secret weapon for point selection
					if (!editor.coordsRecorder.some(v => (v.x === x && v.y === y))) {
						editor.coordsRecorder.push({ x, y });
						editor.draw.dot(x, y);
					}
					break;
				}
			}

			this.startPixelX = this.lastPixelX = x;
			this.startPixelY = this.lastPixelY = y;
			this.mouseBtnFlag = 1;
		}

		this.mouseNotMoved = true;
	}

	/**
	 * Handler of `mousemove` event.
	 *
	 * @param {React.MouseEvent} e
	 */
	mouseMove(e: React.MouseEvent) {
		const { x, y, column } = editor.translateCoords(e.pageX, e.pageY);

		editor.redrawStatusBar(x, y, column);

		if (this.activeSnippet != null) {
			this.placeSnippetTo(x, y);

		} else if (this.mouseBtnFlag === 0) {
			return;

		} else if (this.mouseBtnFlag === 2) {
			editor.scroller.doTouchMove([{
				pageX: e.pageX,
				pageY: e.pageY
			}], e.timeStamp);

			if (e.button === 0) {
				editor.scroller.doTouchEnd(e.timeStamp);
			}

		} else {
			switch (editor.editTool) {
				case EditorTool.Selection: {
					if (!this.mouseNotMoved) {
						const { x0, y0 } = editor.selection;
						editor.selection.set(x0, y0, x - 1, y - 1);

						this.redrawRect(x, y, false);
					}
					break;
				}
				case EditorTool.GridSelect: {
					if (!this.mouseNotMoved) {
						const { x0, y0 } = editor.selection;
						editor.selection.set(x0, y0, (Math.ceil(x / 6) * 6) - 1, y - 1);

						this.redrawRect(x, y, false);
					}
					break;
				}
				case EditorTool.Pencil: {
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
				case EditorTool.Lines: {
					editor.pixel.undo(this.actionSnapshot);
					editor.draw.line(
						this.startPixelX,
						this.startPixelY,
						x, y, true, false
					);

					this.redrawRect(x, y);
					break;
				}
				case EditorTool.Ellipse: {
					editor.pixel.undo(this.actionSnapshot);
					editor.draw.ellipse(
						this.startPixelX,
						this.startPixelY,
						x, y, editor.editFilled
					);

					this.redrawRect(x, y);
					break;
				}
				case EditorTool.Rectangle: {
					editor.pixel.undo(this.actionSnapshot);
					editor.draw.rectangle(
						this.startPixelX,
						this.startPixelY,
						x, y, editor.editFilled
					);

					this.redrawRect(x, y);
					break;
				}
			}

			this.lastPixelX = x;
			this.lastPixelY = y;
		}

		this.mouseNotMoved = false;
	}

	/**
	 * Handler of `mouseup` event.
	 *
	 * @param {React.MouseEvent} e
	 */
	mouseUp(e: React.MouseEvent) {
		if (this.mouseBtnFlag === 0) {
			return;

		} else if (this.activeSnippet != null) {
			this.activeSnippet = null;

		} else if (e.button > 0) {
			editor.scroller.doTouchEnd(e.timeStamp);

		} else {
			const { x, y } = editor.translateCoords(e.pageX, e.pageY);

			switch (editor.editTool) {
				case EditorTool.Selection: {
					if (!this.mouseNotMoved) {
						const { x0, y0 } = editor.selection;
						editor.selection.set(x0, y0, x - 1, y - 1);

						this.redrawRect(x, y, false);
					}

					editor.selectionActionCallback(editor.selection.nonEmpty());
					break;
				}
				case EditorTool.GridSelect: {
					if (!this.mouseNotMoved) {
						const { x0, y0 } = editor.selection;
						editor.selection.set(x0, y0, (Math.ceil(x / 6) * 6) - 1, y - 1);

						this.redrawRect(x, y, false);
					}

					editor.selectionActionCallback(editor.selection.nonEmpty());
					break;
				}
				case EditorTool.Pencil: {
					if (!this.mouseNotMoved &&
						(this.lastPixelX !== x || this.lastPixelY !== y)) {

						editor.draw.line(this.lastPixelX, this.lastPixelY, x, y, true);
					}
					break;
				}
				case EditorTool.Lines: {
					editor.pixel.undo(this.actionSnapshot);
					editor.draw.line(
						this.startPixelX,
						this.startPixelY,
						x, y, true, false
					);

					this.redrawRect(x, y);
					break;
				}
				case EditorTool.Ellipse: {
					editor.pixel.undo(this.actionSnapshot);
					editor.draw.ellipse(
						this.startPixelX,
						this.startPixelY,
						x, y, editor.editFilled
					);

					this.redrawRect(x, y);
					break;
				}
				case EditorTool.Rectangle: {
					editor.pixel.undo(this.actionSnapshot);
					editor.draw.rectangle(
						this.startPixelX,
						this.startPixelY,
						x, y, editor.editFilled
					);

					this.redrawRect(x, y);
					break;
				}
			}
		}

		this.actionSnapshot = null;
		this.mouseNotMoved = true;
		this.mouseBtnFlag = 0;
	}

	/**
	 * Debounced handler of `mousewheel` event.
	 *
	 * @param {React.MouseEvent} e
	 */
	@debounce(16, { leading: true })
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

	/**
	 * Helper method to zoom viewport by given delta zoom factor and redraw statusbar.
	 *
	 * @param {number} (optional) delta signed integer which modified zoom factor
	 * @param {number} (optional) x coordinate to zoom in
	 * @param {number} (optional) y coordinate to zoom in
	 */
	zoomViewport(delta: number = 0, x: number = this.lastPixelX, y: number = this.lastPixelY) {
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

	/**
	 * Clear to black or invert current selection.
	 * Optionally reset attributes to green { 0, 0 }.
	 *
	 * @param {boolean} resetAttrs (optional)
	 * @param {boolean} invert (optional)
	 */
	fillSelection(resetAttrs: boolean = false, invert: boolean = false) {
		if (editor.selection.nonEmpty()) {
			const { x1, y1, x2, y2 } = editor.selection;

			editor.pixel.doSnapshot();

			const c = resetAttrs ? 4 : 0;
			const mode = invert ? EditorDrawMode.Over : EditorDrawMode.Reset;

			for (let y = y1; y <= y2; y++) {
				for (let x = x1; x <= x2; x++) {
					editor.pixel.putPixel(x, y, mode, c, false);
				}
			}

			this.startPixelX = x1;
			this.startPixelY = y1;
			this.redrawRect(x2, y2);
		}
	}

	/**
	 * Cancel current operation and restore to snapshot.
	 */
	cancel() {
		if (this.mouseBtnFlag === 1) {
			switch (editor.editTool) {
				case EditorTool.Pencil:
				case EditorTool.Lines:
				case EditorTool.Ellipse:
				case EditorTool.Rectangle:
					editor.pixel.undo(this.actionSnapshot);
					break;
			}

			this.actionSnapshot = null;
			this.mouseNotMoved = true;
			this.mouseBtnFlag = 0;

			editor.refresh();
		}
	}

	/**
	 * Create snippet with all pixel color data of given selection.
	 */
	createSnippet(cut: boolean = false) {
		if (editor.selection.nonEmpty()) {
			editor.pixel.doSnapshot();

			const { x1, y1, x2, y2, w, h } = editor.selection;
			this.activeSnippet = new EditorSnippet(w, h);

			for (let y = y1, i = 0, x: number; y <= y2; y++) {
				for (x = x1; x <= x2; x++) {
					this.activeSnippet.data[i++] = editor.pixel.getPixel(x, y);

					if (cut) {
						editor.pixel.putPixel(x, y, EditorDrawMode.Reset, 0, false);
					}
				}
			}

			if (cut) {
				this.startPixelX = x1;
				this.startPixelY = y1;
				this.redrawRect(x2, y2, false);
			}

			this.actionSnapshot = editor.pixel.doSnapshot(true);
			editor.selection.reset();
		}
	}

	/**
	 * Place active snippet into given position.
	 *
	 * @param {number} sx
	 * @param {number} sy
	 * @param {boolean} (optional) attrs - flag if attributes will be modified
	 */
	private placeSnippetTo(sx: number, sy: number, attrs: boolean = false) {
		const sx2 = sx + this.activeSnippet.width - 1;
		const sy2 = sy + this.activeSnippet.height - 1;

		editor.pixel.undo(this.actionSnapshot);

		let i = 0, c: number, x: number;
		for (let y = sy; y <= sy2; y++) {
			for (x = sx; x <= sx2; x++) {
				c = this.activeSnippet.data[i++];

				editor.pixel.putPixel(
					x, y,
					c ? EditorDrawMode.Set : EditorDrawMode.Reset,
					attrs ? c : 0,
					false
				);
			}
		}

		this.startPixelX = sx;
		this.startPixelY = sy;
		this.redrawRect(sx2, sy2, false);
	}

	/**
	 * Helper method to redraw "outer rectangle", so it takes into account start,
	 * current and last mouse coordinates and adjust to include whole attributes.
	 *
	 * @param {number} x2 current X coordinate
	 * @param {number} y2 current Y coordinate
	 * @param {boolean} attrs redraw also attributes
	 */
	private redrawRect(x2: number, y2: number, attrs: boolean = true) {
		let x1: number, y1: number;

		if (this.startPixelX > x2) {
			x1 = x2;
			x2 = this.startPixelX;
		} else {
			x1 = this.startPixelX;
		}

		if (this.startPixelY > y2) {
			y1 = y2;
			y2 = this.startPixelY;
		} else {
			y1 = this.startPixelY;
		}

		if (this.lastPixelX > x2) {
			x2 = this.lastPixelX;
		} else if (this.lastPixelX < x1) {
			x1 = this.lastPixelX;
		}
		if (this.lastPixelY > y2) {
			y2 = this.lastPixelY;
		} else if (this.lastPixelY < y1) {
			y1 = this.lastPixelY;
		}

		x1 = Math.max(0, Math.floor(--x1 / 6) * 6);
		x2 = Math.min(288, Math.ceil(++x2 / 6) * 6);
		y1 = Math.max(0, (y1 & ~1) - 2);
		y2 = Math.min(256, (y2 & ~1) + 2);

		editor.pixel.redrawRect(x1, y1, (x2 - x1), (y2 - y1), attrs);
	}
}
