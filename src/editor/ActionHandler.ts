/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Handler - translate mouse handlers to function by selected function
 *
 * Copyright (c) 2014-2019 Martin Bórik
 */

import { editor } from "./Editor";


export interface MouseMoveEvent extends MouseEvent {
	lastXCoord: number;
	lastYCoord: number;
	notMoved: boolean;
}

export class ActionHandler {
	a80data: { x: number, y: number }[] = [];

	mouseDown(o: MouseMoveEvent) {
		switch (editor.editTool) {
		// selection
			case 0:
				editor.selection.reset(o.x, o.y);
				editor.scroller.zoomTo(editor.zoomFactor);
				break;

		// grid selection
			case 1:
				editor.selection.reset(Math.floor(o.x / 6) * 6, o.y);
				editor.scroller.zoomTo(editor.zoomFactor);
				break;

		// pencil
			case 2:
				editor.draw.dot(o.x, o.y);
				break;

		// brush
			case 3:
				editor.draw.dot(o.x, o.y);
				// secret weapon for point selection
				if (!this.a80data.some(v => (v.x === o.x && v.y === o.y))) {
					this.a80data.push({ x: o.x, y: o.y });
				}
				break;

			default:
				break;
		}
	};

	mouseMove(o: MouseMoveEvent) {
		switch (editor.editTool) {
		// selection
			case 0:
				if (!o.notMoved) editor.pixel.redrawSelection(function(s) {
					s.set(s.x0, s.y0, o.x - 1, o.y - 1);
				});
				break;

		// grid selection
			case 1:
				if (!o.notMoved) editor.pixel.redrawSelection(function(s) {
					s.set(s.x0, s.y0, (Math.ceil(o.x / 6) * 6) - 1, o.y - 1);
				});
				break;

		// pencil
			case 2:
				if (o.lastXCoord !== o.x || o.lastYCoord !== o.y)
					editor.draw.line(o.lastXCoord, o.lastYCoord, o.x, o.y, o.notMoved);
				break;

			default:
				break;
		}
	};

	mouseUp(o: MouseMoveEvent) {
		switch (editor.editTool) {
		// selection
			case 0:
				if (!o.notMoved) {
					editor.pixel.redrawSelection(() => {
						editor.selection.set(
							editor.selection.x0,
							editor.selection.y0,
							o.x - 1, o.y - 1
						);
					});
				}

				// @TODO FIXME
				// editor.selectionCallback(editor.selection.nonEmpty());
				break;

		// grid selection
			case 1:
				if (!o.notMoved) {
					editor.pixel.redrawSelection(() => {
						editor.selection.set(
							editor.selection.x0,
							editor.selection.y0,
							(Math.ceil(o.x / 6) * 6) - 1, o.y - 1
						);
					});
				}

				// @TODO FIXME
				// editor.selectionCallback(editor.selection.nonEmpty());
				break;

		// pencil
			case 2:
				if (!o.notMoved && (o.lastXCoord !== o.x || o.lastYCoord !== o.y)) {
					editor.draw.line(o.lastXCoord, o.lastYCoord, o.x, o.y, true);
				}
				break;

			default:
				break;
		}
	}
}
