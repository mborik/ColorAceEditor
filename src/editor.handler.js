/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Handler - translate mouse handlers to function by selected function
 *
 * Copyright (c) 2012-2014 Martin Borik
 */

ColorAceEditor.Handler = function(e) {
	var self = {}, draw = e.draw;

	self.mouseDown = function(o) {
		draw.dot(o.x, o.y);
	};

	self.mouseMove = function(o) {
		if (o.lx != o.x || o.ly != o.y)
			draw.line(o.lx, o.ly, o.x, o.y, o.mov);
	};

	self.mouseUp = function(o) {
		if (o.mov)
			draw.dot(o.x, o.y);
		else if (o.lx != o.x || o.ly != o.y)
			draw.line(o.lx, o.ly, o.x, o.y, true);
	};

	return self;
};
