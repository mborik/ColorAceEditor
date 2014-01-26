/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Drawing - custom artistic methods
 *
 * Copyright (c) 2012-2014 Martin Borik
 */

ColorAceEditor.Drawing = function() {
	var self = {};

	/**
	 * putPixel wrapper only.
	 * @param {number} x coordinate in surface (0-287)
	 * @param {number} y coordinate in surface (0-255)
	 */
	self.dot = function(x, y) {
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
	self.line = function(x1, y1, x2, y2, drawFirst) {
		var dx = Math.abs(x2 - x1), sx = x1 < x2 ? 1 : -1,
			dy = Math.abs(y2 - y1), sy = y1 < y2 ? 1 : -1,
			err = (dx > dy ? dx : -dy) / 2, err2;

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
	};

	return self;
};
//-----------------------------------------------------------------------------

/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Rect - custom rectangle class
 *
 * Copyright (c) 2014 Martin Borik
 */

ColorAceEditor.Selection = function() {
	var self = {
		x0: 0, y0: 0,
		x1: 0, y1: 0,
		x2: 0, y2: 0,
		w: 0, h: 0
	}, sw;

	/**
	 * Set exact rectangle.
	 * @param {number} x1 coordinate in surface (0-287)
	 * @param {number} y1 coordinate in surface (0-255)
	 * @param {number} x2 coordinate in surface (0-287)
	 * @param {number} y2 coordinate in surface (0-255)
	 * @return {ColorAceEditor.Selection}
	 */
	self.set = function(x1, y1, x2, y2) {
		if (x1 > x2) {
			sw = x1;
			x1 = x2;
			x2 = sw;
		}
		if (y1 > y2) {
			sw = y1;
			y1 = y2;
			y2 = sw;
		}

		if (x1 > 287)
			x1 = 287;
		if (y1 > 255)
			y1 = 255;
		if (x2 > 287)
			x2 = 287;
		if (y2 > 255)
			y2 = 255;

		self.x1 = x1;
		self.y1 = y1;
		self.x2 = x2;
		self.y2 = y2;

		self.w = (x2 - x1) + 1;
		self.h = (y2 - y1) + 1;

		return self;
	};

	/**
	 * Reset rectangle to empty, optionally offset to entry point.
	 * @param {number} [x] coordinate in surface (0-287)
	 * @param {number} [y] coordinate in surface (0-255)
	 * @return {ColorAceEditor.Selection}
	 */
	self.reset = function(x, y) {
		x = x || 0;
		y = y || 0;

		if (x > 287)
			x = 287;
		if (y > 255)
			y = 255;

		self.x0 = x; self.y0 = y;
		self.x1 = x; self.y1 = y;
		self.x2 = x; self.y2 = y;
		self.w = self.h = 0;

		return self;
	};

	/**
	 * Offset rectangle by x,y coordinates.
	 * @param  {number} x offset
	 * @param  {number} y offset
	 * @return {ColorAceEditor.Selection}
	 */
	self.offsetBy = function(x, y) {
		self.x1 += x;
		self.y1 += y;
		self.x2 += x;
		self.y2 += y;

		if (self.x1 > 287 || self.y1 > 255)
			return self.reset();
		else if (self.x2 > 287 || self.y2 > 255) {
			self.x2 = 287;
			self.y2 = 255;
			self.w = (self.x2 - self.x1) + 1;
			self.h = (self.y2 - self.y1) + 1;
		}

		self.x0 = self.x1;
		self.y0 = self.y1;

		return self;
	};

	/**
	 * Union a expand rectangle with another one.
	 * @param  {ColorAceEditor.Selection} obj
	 * @return {ColorAceEditor.Selection}
	 */
	self.unionWith = function(obj) {
		if (typeof obj !== typeof self)
			return false;

		self.x1 = Math.min(self.x1, obj.x1);
		self.y1 = Math.min(self.y1, obj.y1);
		self.x2 = Math.min(self.x2, obj.x2);
		self.y2 = Math.min(self.y2, obj.y2);

		self.w = (x2 - x1) + 1;
		self.h = (y2 - y1) + 1;

		return self;
	};

	/**
	 * Test empty rectangle.
	 * @return {boolean}
	 */
	self.nonEmpty = function() {
		return self.x1 < self.x2 && self.y1 < self.y2;
	};

	/**
	 * Test if given coordinate lie on X-bounds of rectangle.
	 * @param {number} [x] coordinate in surface (0-287)
	 * @param {number} [y] coordinate in surface (0-255)
	 * @return {number} 1-left, 2-right, 0-not match bounds
	 */
	self.testBoundsX = function(x, y) {
		if (self.x1 < self.x2 && self.y1 <= y && self.y2 >= y) {
			if (x == self.x1)
				return 1;
			else if (x == self.x2)
				return 2;
		}

		return 0;
	};

	/**
	 * Test if given coordinate lie on Y-bounds of rectangle.
	 * @param {number} [x] coordinate in surface (0-287)
	 * @param {number} [y] coordinate in surface (0-255)
	 * @return {number} 1-left, 2-right, 0-not match bounds
	 */
	self.testBoundsY = function(x, y) {
		if (self.y1 < self.y2 && self.x1 <= x && self.x2 >= x) {
			if (y == self.y1)
				return 1;
			else if (y == self.y2)
				return 2;
		}

		return 0;
	};


	if (arguments.length > 0) {
		if (typeof arguments[0] === 'object')
			$.extend(self, arguments[0]);
		else if (typeof arguments[0] === 'number' && arguments.length == 4)
			self.set(arguments[0], arguments[1], arguments[2], arguments[3]);
	}

	return self;
};
