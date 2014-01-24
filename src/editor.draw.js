/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Drawing - custom artistic methods
 *
 * Copyright (c) 2012-2014 Martin Borik
 */

ColorAceEditor.Drawing = function(e) {
	var self = {};

	self.dot = function(x, y) {
		e.pixel.putPixel(x, y, e.editMode, e.editColor);
	};

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
