/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Selecton - selection object and its tools
 *
 * Copyright (c) 2014-2019 Martin Bórik
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
	w: number  = 0;
	h: number  = 0;

	/**
	 * Set exact rectangle.
	 * @param {number} x1 coordinate in surface (0-287)
	 * @param {number} y1 coordinate in surface (0-255)
	 * @param {number} x2 coordinate in surface (0-287)
	 * @param {number} y2 coordinate in surface (0-255)
	 * @return {Selection}
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

		this.w = (x2 - x1) + 1;
		this.h = (y2 - y1) + 1;

		return this;
	}

	/**
	 * Reset rectangle to empty, optionally offset to entry point.
	 * @param {number} x (optional) coordinate in surface (0-287)
	 * @param {number} y (optional) coordinate in surface (0-255)
	 * @return {Selection}
	 */
	reset(x: number = 0, y: number = 0): Selection {
		if (x > 287)
			x = 287;
		if (y > 255)
			y = 255;

		this.x0 = x; this.y0 = y;
		this.x1 = x; this.y1 = y;
		this.x2 = x; this.y2 = y;
		this.w = this.h = 0;

		return this;
	};

	/**
	 * Offset rectangle by x,y coordinates.
	 * @param  {number} x offset
	 * @param  {number} y offset
	 * @return {Selection}
	 */
	offsetBy(x: number, y: number): Selection {
		this.x1 += x;
		this.y1 += y;
		this.x2 += x;
		this.y2 += y;

		if (this.x1 > 287 || this.y1 > 255) {
			return this.reset();
		}
		else if (this.x2 > 287 || this.y2 > 255) {
			this.x2 = 287;
			this.y2 = 255;
			this.w = (this.x2 - this.x1) + 1;
			this.h = (this.y2 - this.y1) + 1;
		}

		this.x0 = this.x1;
		this.y0 = this.y1;

		return this;
	};

	/**
	 * Union a expand rectangle with another one.
	 * @param  {SelectionObject} obj
	 * @return {Selection}
	 */
	unionWith(obj: SelectionObject): Selection {
		this.x1 = Math.min(this.x1, obj.x1);
		this.y1 = Math.min(this.y1, obj.y1);
		this.x2 = Math.min(this.x2, obj.x2);
		this.y2 = Math.min(this.y2, obj.y2);

		this.w = (obj.x2 - obj.x1) + 1;
		this.h = (obj.y2 - obj.y1) + 1;

		return this;
	}

	/**
	 * Test empty rectangle.
	 * @return {boolean}
	 */
	nonEmpty(): boolean {
		return this.x1 < this.x2 && this.y1 < this.y2;
	}

	/**
	 * Test if given coordinate lie on X-bounds of rectangle.
	 * @param {number} [x] coordinate in surface (0-287)
	 * @param {number} [y] coordinate in surface (0-255)
	 * @return {number} 1-left, 2-right, 0-not match bounds
	 */
	testBoundsX(x: number, y: number): number {
		if (this.x1 < this.x2 && this.y1 <= y && this.y2 >= y) {
			if (x === this.x1)
				return 1;
			else if (x === this.x2)
				return 2;
		}

		return 0;
	}

	/**
	 * Test if given coordinate lie on Y-bounds of rectangle.
	 * @param {number} [x] coordinate in surface (0-287)
	 * @param {number} [y] coordinate in surface (0-255)
	 * @return {number} 1-left, 2-right, 0-not match bounds
	 */
	testBoundsY(x: number, y: number): number {
		if (this.y1 < this.y2 && this.x1 <= x && this.x2 >= x) {
			if (y === this.y1)
				return 1;
			else if (y === this.y2)
				return 2;
		}

		return 0;
	}
}
