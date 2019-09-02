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
	 *
	 * @param {number} x coordinate in surface (0-287)
	 * @param {number} y coordinate in surface (0-255)
	 * @param {boolean} shouldRedraw (optional)
	 */
	dot(x: number, y: number, shouldRedraw: boolean = true) {
		editor.pixel.putPixel(x, y, editor.editMode, editor.editColor, shouldRedraw);
	};

	/**
	 * Bresenham's scan-line algorithm.
	 *
	 * @param {number} x1 coordinate in surface (0-287)
	 * @param {number} y1 coordinate in surface (0-255)
	 * @param {number} x2 coordinate in surface (0-287)
	 * @param {number} y2 coordinate in surface (0-255)
	 * @param {boolean} drawFirst flag if it's needed to draw first point of line
	 */
	line(x1: number, y1: number, x2: number, y2: number, drawFirst: boolean, shouldRedraw: boolean = true) {
		const dx = Math.abs(x2 - x1), sx = x1 < x2 ? 1 : -1;
		const dy = Math.abs(y2 - y1), sy = y1 < y2 ? 1 : -1;
		let err = (dx > dy ? dx : -dy) / 2, err2: number;

		while (true) {
			if (drawFirst) {
				this.dot(x1, y1, shouldRedraw);
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
	 *
	 * @param {number} x1 coordinate in surface (0-287)
	 * @param {number} y1 coordinate in surface (0-255)
	 * @param {number} x2 coordinate in surface (0-287)
	 * @param {number} y2 coordinate in surface (0-255)
	 * @param {boolean} filled flag if we filling the rectangle
	 */
	rectangle(x1: number, y1: number, x2: number, y2: number, filled: boolean) {
		if (x1 === x2 || y1 === y2) {
			this.dot(x1, y1, false);

		} else {
			// sort out the coords
			let sw: number;
			if (x1 > x2) {
				sw = x2;
				x2 = x1;
				x1 = sw;
			}
			if (y1 > y2) {
				sw = y2;
				y2 = y1;
				y1 = sw;
			}

			for (let y = y1; y <= y2; y++) {
				let x = x1;

				this.dot(x, y, false);

				if (filled || y === y1 || y === y2) {
					for (++x; x < x2; x++) {
						this.dot(x, y, false);
					}
				} else {
					x = x2;
				}

				this.dot(x, y, false);
			}
		}
	}

	/**
	 * Complex ellipse drawing algorithm.
	 *
	 * @param {number} x1 coordinate in surface (0-287)
	 * @param {number} y1 coordinate in surface (0-255)
	 * @param {number} x2 coordinate in surface (0-287)
	 * @param {number} y2 coordinate in surface (0-255)
	 * @param {boolean} filled flag if we filling the ellipse
	 */
	ellipse(x1: number, y1: number, x2: number, y2: number, filled: boolean) {
		if (x1 === x2 || y1 === y2) {
			this.dot(x1, y1, false);

		} else {
			const coords = new Set<number>();
			const putPixel = (x: number, y: number) => {
				if (x >= 0 && x < 288 && y >= 0 && y < 256) {
					const n = y | (x << 8);
					if (coords.size < coords.add(n).size) {
						this.dot(x, y, false);
					}
				}
			};

			// sort out the coords
			let sw: number;
			if (x1 > x2) {
				sw = x2;
				x2 = x1;
				x1 = sw;
			}
			if (y1 > y2) {
				sw = y2;
				y2 = y1;
				y1 = sw;
			}

			const ellipseWidth = (x2 - x1) + 1;
			const ellipseHeight = (y2 - y1) + 1;
			const radiusX = ellipseWidth >> 1;
			const radiusY = ellipseHeight >> 1;

			// keep track of the previous y position
			let prevY = 0;
			let firstRun = true;

			for (let x = 0; x <= radiusX; ++x) {
				let xPos = x + x1;
				let rxPos = ellipseWidth - x - 1 + x1;

				let xRad = x - radiusX;
				let yRad = radiusY * -(Math.sqrt(1 - (xRad / radiusX) ** 2));
				let y = Math.floor(yRad + radiusY);
				let yPos = y + y1;

				let ryPos = ellipseHeight - y - 1 + y1;

				if (yPos >= 0) {
					putPixel(xPos, yPos);
					putPixel(xPos, ryPos);
					putPixel(rxPos, yPos);
					putPixel(rxPos, ryPos);
				}

				// while there's a >1 jump in y, fill in the gap
				// (assumes that this is not 1st time we've tracked y, x != 0)
				for (let j = prevY - 1; !firstRun && j > y - 1 && y > 0; --j) {
					let jPos = j + y1;
					let rjPos = ellipseHeight - j - 1 + y1;

					if (jPos === rjPos - 1) {
						continue;
					}

					putPixel(xPos, jPos);
					putPixel(xPos, rjPos);
					putPixel(rxPos, jPos);
					putPixel(rxPos, rjPos);
				}

				firstRun = false;
				prevY = y;
				const countTarget = radiusY - y;

				for (let count = 0; filled && count < countTarget; ++count) {
					++yPos;
					--ryPos;

					// set all four points in the matrix to fill the ellipse...
					putPixel(xPos, yPos);
					putPixel(xPos, ryPos);
					putPixel(rxPos, yPos);
					putPixel(rxPos, ryPos);
				}
			}
		}
	}
}
