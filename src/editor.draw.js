/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Drawing - custom artistic methods
 *
 * Copyright (c) 2012-2014 Martin Borik
 */

ColorAceEditor.Drawing = function(e) {
	var self = {};

	/**
	 * Only putPixel wrapper.
	 * @param {number} x coordinate in surface (0-287)
	 * @param {number} y coordinate in surface (0-255)
	 */
	self.dot = function(x, y) {
		e.pixel.putPixel(x, y, e.editMode, e.editColor);
	};

	/**
	 * Bresenham's scan-line algorithm.
	 * @param {number} x0 coordinate in surface (0-287)
	 * @param {number} y0 coordinate in surface (0-255)
	 * @param {number} x1 coordinate in surface (0-287)
	 * @param {number} y1 coordinate in surface (0-255)
	 * @param {boolean} drawFirst flag if it's needed to draw first point of line
	 */
	self.line = function(x0, y0, x1, y1, drawFirst) {
		var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1,
			dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1,
			err = (dx > dy ? dx : -dy) / 2, err2;

		while (true) {
			if (drawFirst)
				e.pixel.putPixel(x0, y0, e.editMode, e.editColor);

			drawFirst = true;
			if (x0 === x1 && y0 === y1)
				break;

			err2 = err;
			if (err2 > -dx) {
				err -= dy;
				x0 += sx;
			}
			if (err2 < dy) {
				err += dx;
				y0 += sy;
			}
		}
	};

	return self;
};
