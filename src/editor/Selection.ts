/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Selecton - selection object and its tools
 *
 * Copyright (c) 2014-2022 Martin Bórik
 */

export interface SelectionObject {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}

export class Selection implements SelectionObject {
	x0: number = 0;
	y0: number = 0;
	x1: number = 0;
	y1: number = 0;
	x2: number = 0;
	y2: number = 0;

	w: number = 0;
	h: number = 0;

	/**
	 * Set exact rectangle.
	 *
	 * @param x1 Coordinate in surface (0-287)
	 * @param y1 Coordinate in surface (0-255)
	 * @param x2 Coordinate in surface (0-287)
	 * @param y2 Coordinate in surface (0-255)
	 */
	set(x1: number, y1: number, x2: number, y2: number): Selection {
		if (x1 > x2) {
			const sw = x1;
			x1 = x2;
			x2 = sw;
		}
		if (y1 > y2) {
			const sw = y1;
			y1 = y2;
			y2 = sw;
		}

		this.x1 = Math.max(0, Math.min(287, x1));
		this.y1 = Math.max(0, Math.min(255, y1));
		this.x2 = Math.max(0, Math.min(287, x2));
		this.y2 = Math.max(0, Math.min(255, y2));

		this.w = (this.x2 - this.x1) + 1;
		this.h = (this.y2 - this.y1) + 1;

		return this;
	}

	/**
	 * Reset rectangle to empty, optionally offset to entry point.
	 *
	 * @param x Coordinate in surface (0-287)
	 * @param y Coordinate in surface (0-255)
	 */
	reset(x: number = 0, y: number = 0): Selection {
		if (x > 287) {
			x = 287;
		}
		if (y > 255) {
			y = 255;
		}

		this.x0 = x; this.y0 = y;
		this.x1 = x; this.y1 = y;
		this.x2 = x; this.y2 = y;
		this.w = this.h = 0;

		return this;
	}

	/**
	 * Test empty rectangle.
	 */
	nonEmpty(): boolean {
		return this.x1 < this.x2 && this.y1 < this.y2;
	}

	/**
	 * Test if given coordinate lie on X-bounds of rectangle.
	 *
	 * @param x Coordinate in surface (0-287)
	 * @param y Coordinate in surface (0-255)
	 * @return 1-left, 2-right, 0-not match bounds
	 */
	testBoundsX(x: number, y: number): number {
		if (this.x1 < this.x2 && this.y1 <= y && this.y2 >= y) {
			if (x === this.x1) {
				return 1;
			}
			else if (x === this.x2) {
				return 2;
			}
		}

		return 0;
	}

	/**
	 * Test if given coordinate lie on Y-bounds of rectangle.
	 *
	 * @param x Coordinate in surface (0-287)
	 * @param y Coordinate in surface (0-255)
	 * @return 1-left, 2-right, 0-not match bounds
	 */
	testBoundsY(x: number, y: number): number {
		if (this.y1 < this.y2 && this.x1 <= x && this.x2 >= x) {
			if (y === this.y1) {
				return 1;
			}
			else if (y === this.y2) {
				return 2;
			}
		}

		return 0;
	}

	/**
	 * Test if current selection bounds onto attribute regions.
	 */
	testAttrBounds(): boolean {
		return (
			(Math.floor(this.x1 / 6) * 6) === this.x1 &&
			(Math.ceil(this.x2 / 6) * 6) === (this.x2 + 1) &&
			(this.y1 & 1) === 0 && (this.y2 & 1) === 1
		);
	}
}
