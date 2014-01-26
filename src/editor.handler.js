/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Handler - translate mouse handlers to function by selected function
 *
 * Copyright (c) 2014 Martin Borik
 */

ColorAceEditor.Handler = function(e) {
	var self = {}, draw = e.draw;

	self.mouseDown = function(o) {
		switch (e.editTool) {
		// selection
			case 0:
				e.selection.reset(o.x, o.y);
				e.scroller.zoomTo(editor.zoomFactor);
				break;
		// grid selection
			case 1:
				e.selection.reset(Math.floor(o.x / 6) * 6, o.y);
				e.scroller.zoomTo(editor.zoomFactor);
				break;
		// pencil
			case 2:
				draw.dot(o.x, o.y);
				break;

			default:
				break;
		}
	};

	self.mouseMove = function(o) {
		switch (e.editTool) {
		// selection
			case 0:
				if (!o.mov) e.pixel.redrawSelection(function(s) {
					s.set(s.x0, s.y0, o.x - 1, o.y - 1);
				});
				break;
		// grid selection
			case 1:
				if (!o.mov) e.pixel.redrawSelection(function(s) {
					s.set(s.x0, s.y0, (Math.ceil(o.x / 6) * 6) - 1, o.y - 1);
				});
				break;
		// pencil
			case 2:
				if (o.lx != o.x || o.ly != o.y)
					draw.line(o.lx, o.ly, o.x, o.y, o.mov);
				break;

			default:
				break;
		}
	};

	self.mouseUp = function(o) {
		switch (e.editTool) {
		// selection
			case 0:
				if (!o.mov) e.pixel.redrawSelection(function() {
					e.selection.set(e.selection.x0, e.selection.y0, o.x - 1, o.y - 1);
				});
				break;
		// grid selection
			case 1:
				if (!o.mov) e.pixel.redrawSelection(function() {
					e.selection.set(e.selection.x0, e.selection.y0, (Math.ceil(o.x / 6) * 6) - 1, o.y - 1);
				});
				break;
		// pencil
			case 2:
				if (!o.mov && (o.lx != o.x || o.ly != o.y))
					draw.line(o.lx, o.ly, o.x, o.y, true);
				break;

			default:
				break;
		}
	};

	return self;
};
