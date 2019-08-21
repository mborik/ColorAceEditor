/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Drawing - custom artistic methods
 *
 * Copyright (c) 2012-2019 Martin Bórik
 */

import { editor } from "./Editor";


export class Drawing {
	/**
	 * putPixel wrapper only.
	 * @param {number} x coordinate in surface (0-287)
	 * @param {number} y coordinate in surface (0-255)
	 */
	dot(x: number, y: number) {
		editor.pixel.putPixel(x, y, editor.editMode, editor.editColor);
	};

	/**
	 * Bresenham's scan-line algorithm.
	 * @param {number} x1 coordinate in surface (0-287)
	 * @param {number} y1 coordinate in surface (0-255)
	 * @param {number} x2 coordinate in surface (0-287)
	 * @param {number} y2 coordinate in surface (0-255)
	 * @param {boolean} drawFirst flag if it's needed to draw first point of line
	 */
	line(x1: number, y1: number, x2: number, y2: number, drawFirst: boolean) {
		var dx = Math.abs(x2 - x1), sx = x1 < x2 ? 1 : -1,
			dy = Math.abs(y2 - y1), sy = y1 < y2 ? 1 : -1,
			err = (dx > dy ? dx : -dy) / 2, err2: number;

		while (true) {
			if (drawFirst)
				editor.pixel.putPixel(x1, y1, editor.editMode, editor.editColor);

			drawFirst = true;
			if (x1 === x2 && y1 === y2)
				break;

			err2 = err;
			if (err2 > -dx) {
				err -= dy;
				x1 += sx;
			}
			if (err2 < dy) {
				err += dx;
				y1 += sy;
			}
		}
	}
}
