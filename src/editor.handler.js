/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Handler - translate mouse handlers to function by selected function
 *
 * Copyright (c) 2014 Martin Borik
 */

ColorAceEditor.Handler = function(e) {
	var self = {};

	self.mouseDown = function(o) {
		switch (editor.editTool) {
		// selection
			case 0:
				editor.selection.reset(o.x, o.y);
				editor.scroller.zoomTo(editor.zoomFactor);
				break;
		// grid selection
			case 1:
				editor.selection.reset(Math.floor(o.x / 6) * 6, o.y);
				editor.scroller.zoomTo(editor.zoomFactor);
				break;
		// pencil
			case 2:
				editor.draw.dot(o.x, o.y);
				break;

		// brush [pomocka na oznacovanie bodov ;]
			case 3:
				editor.draw.dot(o.x, o.y);
				if (!editor.a80data)
					editor.a80data = [];

				if (!editor.a80data.some(function (v) {
					return (v.x === o.x && v.y === o.y);
				})) {
					editor.a80data.push({ x: o.x, y: o.y });
				}
				break;
			default:
				break;
		}
	};

	self.mouseMove = function(o) {
		switch (editor.editTool) {
		// selection
			case 0:
				if (!o.mov) editor.pixel.redrawSelection(function(s) {
					s.set(s.x0, s.y0, o.x - 1, o.y - 1);
				});
				break;
		// grid selection
			case 1:
				if (!o.mov) editor.pixel.redrawSelection(function(s) {
					s.set(s.x0, s.y0, (Math.ceil(o.x / 6) * 6) - 1, o.y - 1);
				});
				break;
		// pencil
			case 2:
				if (o.lx != o.x || o.ly != o.y)
					editor.draw.line(o.lx, o.ly, o.x, o.y, o.mov);
				break;

			default:
				break;
		}
	};

	self.mouseUp = function(o) {
		switch (editor.editTool) {
		// selection
			case 0:
				if (!o.mov) editor.pixel.redrawSelection(function() {
					editor.selection.set(editor.selection.x0, editor.selection.y0, o.x - 1, o.y - 1);
				});
				editor.selectionCallback(editor.selection.nonEmpty());
				break;
		// grid selection
			case 1:
				if (!o.mov) editor.pixel.redrawSelection(function() {
					editor.selection.set(editor.selection.x0, editor.selection.y0, (Math.ceil(o.x / 6) * 6) - 1, o.y - 1);
				});
				editor.selectionCallback(editor.selection.nonEmpty());
				break;
		// pencil
			case 2:
				if (!o.mov && (o.lx != o.x || o.ly != o.y))
					editor.draw.line(o.lx, o.ly, o.x, o.y, true);
				break;

			default:
				break;
		}
	};

	self.selectFunction = function() {
	};

	return self;
};
