/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor class
 *
 * Copyright (c) 2012-2014 Martin Borik
 */

function ColorAceEditor(opt) {
	opt = opt || {};
	if (!(opt.canvas && $(opt.canvas).is("canvas")))
		throw "ColorAceEditor: Canvas element not defined!";

	this.canvas = opt.canvas;
	this.ctx = this.canvas.getContext("2d");

	this.statusBar  = opt.status;
	this.zoomFactor = opt.zoom || 1;
	this.showGrid   = opt.grid || true;
	this.undoLevels = opt.undo || 10;
	this.editColor  = 0;
	this.editTool   = 2;
	this.editMode   = 2;

	this.contentWidth  = 0;
	this.contentHeight = 0;

	this.pixel = ColorAceEditor.Pixelator(this);
	this.pixel.preparePixels();

	this.draw    = ColorAceEditor.Drawing(this);
	this.handler = ColorAceEditor.Handler(this);

	this.scroller = new Scroller(this.pixel.render, {
		animating: false,
		bouncing: false,
		snapping: false,
		locking: false,
		zooming: true,
		maxZoom: 16,
		minZoom: 1
	});

	/**
	 * Set editor and scroller dimensions.
	 */
	this.setDimensions = function(w, h) {
		this.contentWidth  = w;
		this.contentHeight = h;
		this.scroller.setDimensions(w - 276, h, 288, 256);
	};

	/**
	 * Translation of "real world" coordinates on page to our pixel space.
	 */
	this.translateCoords = function(sx, sy) {
		var s = this.scroller.getValues(), o = $(this.canvas).offset(), r = {};

		s.left = Math.max(Math.floor(s.left / s.zoom), 0) * s.zoom;
		s.top = Math.max(Math.floor(s.top / s.zoom), 0) * s.zoom;
		sx = (sx - o.left) + s.left;
		sy = (sy - o.top) + s.top;
		r.x = Math.floor(sx / s.zoom);
		r.y = Math.floor(sy / s.zoom);
		r.column = Math.floor(r.x / 6);

		return r;
	};

	this.redrawStatusBar = function(sx, sy) {
		var coords = this.translateCoords(sx, sy),
			x = Math.max(0, Math.min(coords.x, 287)),
			y = Math.max(0, Math.min(coords.y, 255)),
			c = Math.max(0, Math.min(coords.column, 47)),
			a = (0xC000 + (y * 64) + c).toString(16).toUpperCase() + 'h',
			z = this.zoomFactor * 100,
			pad = function(num, len) {
				num = '    ' + num;
				return num.substr(num.length - len);
			};

		this.statusBar.text(pad(z, 4) + '%   X:' + pad(x, 3) + ' Y:' + pad(y, 3) + '  C:' + pad(c, 2) + '   ' + a);
	};
}
