/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.ActionHandler - mouse and action handlers
 *
 * Copyright (c) 2014-2019 Martin Bórik
 */

import React from 'react';
import { debounce } from "typescript-debounce-decorator";
import { ActionShiftFlip } from './ActionShiftFlip';
import { editor, EditorTool, EditorDrawMode } from "./Editor";
import { EditorSnapshot, EditorSnippet } from './Pixelator';


export class ActionHandler extends ActionShiftFlip {
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
		const { x, y } = editor.translateCoords(e.pageX, e.pageY);

		if (e.button > 0) {
			editor.scroller.doTouchStart([{
				pageX: e.pageX,
				pageY: e.pageY
			}], e.timeStamp);

			this.mouseNotMoved = true;
			this.mouseBtnFlag = 2;
			return;

		} else if (this.activeSnippet == null) {
			switch (editor.editTool) {
				case EditorTool.Selection: {
					editor.selection.reset(x, y);
					editor.refresh();
					break;
				}
				case EditorTool.AttrSelect: {
					editor.selection.reset(Math.floor(x / 6) * 6, y & ~1);
					editor.refresh();
					break;
				}
				case EditorTool.Pencil:
				case EditorTool.Lines: {
					this.actionSnapshot = editor.pixel.doSnapshot();
					editor.draw.dot(x, y);
					break;
				}
				case EditorTool.Brush: {
					this.actionSnapshot = editor.pixel.doSnapshot();
					editor.draw.brush(x, y);
					break;
				}
				case EditorTool.Fill:
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

			this.startPixelX = x;
			this.startPixelY = y;
		}

		this.mouseNotMoved = true;
		this.mouseBtnFlag = 1;
		this.lastPixelX = x;
		this.lastPixelY = y;
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
			this._placeSnippetTo(x, y);

		} else if (this.mouseBtnFlag === 2) {
			this.mouseNotMoved = false;

			editor.scroller.doTouchMove([{
				pageX: e.pageX,
				pageY: e.pageY
			}], e.timeStamp);

		} else if (this.mouseBtnFlag !== 0) {
			this.mouseNotMoved = false;

			switch (editor.editTool) {
				case EditorTool.Selection: {
					if (!this.mouseNotMoved) {
						const { x0, y0 } = editor.selection;
						editor.selection.set(x0, y0, x - 1, y - 1);

						this._redrawMouseActionRect(x, y, false);
					}
					break;
				}
				case EditorTool.AttrSelect: {
					if (!this.mouseNotMoved) {
						const { x0, y0 } = editor.selection;
						editor.selection.set(x0, y0, (Math.ceil(x / 6) * 6) - 1, y | 1);

						this._redrawMouseActionRect(x, y, false);
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
				case EditorTool.Brush: {
					if (this.lastPixelX !== x || this.lastPixelY !== y) {
						editor.draw.brush(x, y);
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

					this._redrawMouseActionRect(x, y);
					break;
				}
				case EditorTool.Ellipse: {
					editor.pixel.undo(this.actionSnapshot);
					editor.draw.ellipse(
						this.startPixelX,
						this.startPixelY,
						x, y, editor.editFilled
					);

					this._redrawMouseActionRect(x, y);
					break;
				}
				case EditorTool.Rectangle: {
					editor.pixel.undo(this.actionSnapshot);
					editor.draw.rectangle(
						this.startPixelX,
						this.startPixelY,
						x, y, editor.editFilled
					);

					this._redrawMouseActionRect(x, y);
					break;
				}
			}
		}

		this.lastPixelX = x;
		this.lastPixelY = y;
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

						this._redrawMouseActionRect(x, y, false);
					}

					editor.selectionActionCallback(editor.selection.nonEmpty());
					break;
				}
				case EditorTool.AttrSelect: {
					if (!this.mouseNotMoved) {
						const { x0, y0 } = editor.selection;
						editor.selection.set(x0, y0, (Math.ceil(x / 6) * 6) - 1, y | 1);

						this._redrawMouseActionRect(x, y, false);
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
				case EditorTool.Brush: {
					if (!this.mouseNotMoved &&
						(this.lastPixelX !== x || this.lastPixelY !== y)) {

						editor.draw.brush(x, y);
					}
					break;
				}
				case EditorTool.Fill: {
					if (this.startPixelX === x || this.startPixelY === y) {
						editor.draw.floodFill(x, y);
						editor.refresh();
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

					this._redrawMouseActionRect(x, y);
					break;
				}
				case EditorTool.Ellipse: {
					editor.pixel.undo(this.actionSnapshot);
					editor.draw.ellipse(
						this.startPixelX,
						this.startPixelY,
						x, y, editor.editFilled
					);

					this._redrawMouseActionRect(x, y);
					break;
				}
				case EditorTool.Rectangle: {
					editor.pixel.undo(this.actionSnapshot);
					editor.draw.rectangle(
						this.startPixelX,
						this.startPixelY,
						x, y, editor.editFilled
					);

					this._redrawMouseActionRect(x, y);
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
		if (!this.isActionInProgress() && editor.selection.nonEmpty()) {
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
			this._redrawMouseActionRect(x2, y2);
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

		} else if (this.activeSnippet != null) {
			editor.pixel.undo();
			editor.selection.set(
				this.startPixelX, this.startPixelY,
				this.startPixelX + this.activeSnippet.width - 1,
				this.startPixelY + this.activeSnippet.height - 1
			);

			this.activeSnippet = null;

		} else {
			return;
		}

		this.actionSnapshot = null;
		this.mouseNotMoved = true;
		this.mouseBtnFlag = 0;

		editor.refresh();
	}

	/**
	 * Return true if some operation is in progress.
	 */
	isActionInProgress(): boolean {
		return (this.mouseBtnFlag === 1 || this.activeSnippet != null);
	}

	/**
	 * Create snippet with all pixel color data of given selection.
	 *
	 * @param {boolean} cut (optional) clear selection after copy
	 */
	createSnippet(cut: boolean = false) {
		if (!this.isActionInProgress() && editor.selection.nonEmpty()) {
			editor.pixel.doSnapshot();

			const { x1, y1, x2, y2, w, h } = editor.selection;
			this.activeSnippet = new EditorSnippet(w, h);

			this.startPixelX = x1;
			this.startPixelY = y1;

			for (let y = y1, i = 0, x: number; y <= y2; y++) {
				for (x = x1; x <= x2; x++) {
					this.activeSnippet.data[i++] = editor.pixel.getPixel(x, y);

					if (cut) {
						editor.pixel.putPixel(x, y, EditorDrawMode.Reset, 0, false);
					}
				}
			}

			this.actionSnapshot = editor.pixel.doSnapshot(true);

			if (cut) {
				editor.pixel.redrawOuterRect(x1, y1, x2, y2);
			}

			this._placeSnippetTo(this.lastPixelX, this.lastPixelY);
		}
	}

	doAfterModeChanged() {
		if (this.activeSnippet != null && editor.selection.nonEmpty()) {
			this._placeSnippetTo(this.lastPixelX, this.lastPixelY);
		}
	}

	/**
	 * Place active snippet in the center of given position.
	 *
	 * @param {number} sx
	 * @param {number} sy
	 */
	private _placeSnippetTo(sx: number, sy: number) {
		editor.pixel.undo(this.actionSnapshot);

		sx -= (this.activeSnippet.width >> 1);
		sy -= (this.activeSnippet.height >> 1);

		// flag if attributes will be modified
		const attrs = editor.editSelectFnBlockAttr;
		const mode = editor.editMode;

		const cSet = EditorDrawMode.Set;
		const cRes = EditorDrawMode.Reset;
		const isSet = (mode === cSet);
		const isRes = (mode === cRes);
		const isCol = (mode === EditorDrawMode.Color);

		const sx2 = sx + this.activeSnippet.width - 1;
		const sy2 = sy + this.activeSnippet.height - 1;

		let i = 0, c: number, x: number;
		for (let y = sy; y <= sy2; y++) {
			for (x = sx; x <= sx2; x++) {
				c = this.activeSnippet.data[i++];

				if (isCol && attrs) {
					editor.pixel.putPixel(x, y, mode, c, false);

				} else if (isSet) {
					editor.pixel.putPixel(
						x, y,
						(c ? cSet : cRes),
						(attrs ? c : 0),
						false
					);
				} else if (c) {
					editor.pixel.putPixel(
						x, y,
						isRes ? cRes : cSet,
						attrs ? c : 0,
						false
					);
				}
			}
		}

		editor.selection.set(sx, sy, sx2, sy2);
		editor.pixel.redrawOuterRect(sx, sy, sx2, sy2, attrs);
		editor.refresh();
	}

	/**
	 * Method which takes into account ongoing action start, current and last
	 * known mouse coordinates and calls `redrawOuterRect` to adjust to "outer" rect.
	 *
	 * @param {number} x2 current X coordinate
	 * @param {number} y2 current Y coordinate
	 * @param {boolean} attrs redraw also attributes
	 */
	private _redrawMouseActionRect(x2: number, y2: number, attrs: boolean = true) {
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

		editor.pixel.redrawOuterRect(x1, y1, x2, y2, attrs);
	}
}
