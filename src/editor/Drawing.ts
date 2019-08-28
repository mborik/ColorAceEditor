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
		editor.pixel.putPixel(x, y);
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
		const dx = Math.abs(x2 - x1), sx = x1 < x2 ? 1 : -1;
		const dy = Math.abs(y2 - y1), sy = y1 < y2 ? 1 : -1;
		let err = (dx > dy ? dx : -dy) / 2, err2: number;

		while (true) {
			if (drawFirst) {
				editor.pixel.putPixel(x1, y1);
			}

			drawFirst = true;
			if (x1 === x2 && y1 === y2) {
				break;
			}

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

	/**
	 * Simple rectangle drawing algorithm.
	 * @param {number} x1 coordinate in surface (0-287)
	 * @param {number} y1 coordinate in surface (0-255)
	 * @param {number} x2 coordinate in surface (0-287)
	 * @param {number} y2 coordinate in surface (0-255)
	 * @param {boolean} filled flag if we filling the rectangle
	 */
	rectangle(x1: number, y1: number, x2: number, y2: number, filled: boolean) {
		const putPixel = (x: number, y: number) => editor.pixel.putPixel(
			x, y, editor.editMode, editor.editColor, false
		);

		if (x1 === x2 || y1 === y2) {
			putPixel(x1, y1);
		} else {
			let flip: number;
			if (x1 > x2) {
				flip = x2;
				x2 = x1;
				x1 = flip;
			}
			if (y1 > y2) {
				flip = y2;
				y2 = y1;
				y1 = flip;
			}

			for (let y = y1; y <= y2; y++) {
				let x = x1;

				putPixel(x, y);

				if (filled || y === y1 || y === y2) {
					for (++x; x < x2; x++) {
						putPixel(x, y);
					}
				} else {
					x = x2;
				}

				putPixel(x, y);
			}
		}
	}
}
