/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Drawing - custom artistic methods
 *
 * Copyright (c) 2012-2019 Martin Bórik
 */

import { editor, EditorDrawMode } from "./Editor";


export class Drawing {
	/**
	 * putPixel wrapper only.
	 *
	 * @param {number} x coordinate in surface (0-287)
	 * @param {number} y coordinate in surface (0-255)
	 * @param {boolean} shouldRedraw (optional) default true
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
	 * @param {boolean} shouldRedraw (optional) default true
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
	 * Brush drawing algorithm.
	 *
	 * @param {number} x coordinate in surface (0-287)
	 * @param {number} y coordinate in surface (0-255)
	 */
	brush(x: number, y: number) {
		const brushSize = Math.sqrt(editor.pixel.brush.length);

		const cx1 = x - (brushSize >> 1);
		const cy1 = y - (brushSize >> 1);
		const cx2 = cx1 + brushSize - 1;
		const cy2 = cy1 + brushSize - 1;

		let i = 0;
		for (y = cy1; y <= cy2; y++) {
			for (x = cx1; x <= cx2; x++) {
				if (editor.pixel.brush[i++]) {
					this.dot(x, y, false);
				}
			}
		}

		editor.pixel.redrawOuterRect(cx1, cy1, cx2, cy2, !!editor.editColor);
	}

	/**
	 * Flood-fill algorithm inspired by http://rosettacode.org/wiki/Bitmap/Flood_fill.
	 *
	 * @param {number} x coordinate in surface (0-287)
	 * @param {number} y coordinate in surface (0-255)
	 */
	floodFill(sx: number, sy: number) {
		let cx1 = sx, cy1 = sy, cx2 = sx, cy2 = sy;

		let mode = editor.editMode;
		let set: boolean = !!editor.pixel.getPixel(sx, sy);

		if (mode === EditorDrawMode.Over) {
			mode = set ? EditorDrawMode.Reset : EditorDrawMode.Set;
		}

		const test = (x: number, y: number) => (!editor.pixel.getPixel(x, y) === set);
		const visited = new Set<number>();
		const queue: WebKitPoint[] = [];
		let point: WebKitPoint = { x: sx, y: sy };

		do {
			let x = point.x;
			let y = point.y;

			while (x > 0 && !test(x - 1, y)) {
				x--;
			}

			let spanUp = false;
			let spanDown = false;

			while (visited.size < visited.add(y | (x << 8)).size && x < 288 && !test(x, y)) {
				editor.pixel.putPixel(x, y, mode, editor.editColor, false);

				if (x < cx1) {
					cx1 = x;
				} else if (x > cx2) {
					cx2 = x;
				}
				if (y < cy1) {
					cy1 = y;
				} else if (y > cy2) {
					cy2 = y;
				}

				if (!spanUp && y > 0 && !test(x, y - 1)) {
					queue.push({ x, y: y - 1 });
					spanUp = true;
				}
				else if (spanUp && y > 0 && !!test(x, y - 1)) {
					spanUp = false;
				}

				if (!spanDown && y < 255 && !test(x, y + 1)) {
					queue.push({ x, y: y + 1 });
					spanDown = true;
				}
				else if (spanDown && y < 255 && !!test(x, y + 1)) {
					spanDown = false;
				}

				x++;
			}

			point = queue.shift();

		} while (point != null);

		editor.pixel.redrawOuterRect(cx1, cy1, cx2, cy2, !!editor.editColor);
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
