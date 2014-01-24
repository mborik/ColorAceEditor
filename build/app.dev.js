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

	this.canvas  = opt.canvas;
	this.ctx = this.canvas.getContext("2d");

	this.zoomFactor = opt.zoom || 1;
	this.showGrid   = opt.grid || true;
	this.undoLevels = opt.undo || 10;
	this.editColor  = 0;
	this.editTool   = 0;
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
	}

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
	}
};

/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Pixelator - canvas level methods
 *
 * Copyright (c) 2012-2014 Martin Borik
 */

ColorAceEditor.Pixelator = function(e) {
	var self = {}, currentZoom = 0, scrollerX = 0, scrollerY = 0,
		bmp, bmpW, bmpH, bmpBuffer, bmpClamp, bmpDWORD,
		snapshots = [];

	self.pal = [
		//  pixels       R    G    B    attr
		[ 0, 0, 0, 0,    0,   0,   0,   0, 0 ],
		[ 0, 0, 0, 0,  255,   0,   0,   1, 1 ],
		[ 0, 0, 0, 0,    0,   0, 255,   2, 2 ],
		[ 0, 0, 0, 0,  255,   0, 255,   3, 3 ],
		[ 0, 0, 0, 0,    0, 255,   0,   0, 0 ],
		[ 0, 0, 0, 0,  255, 255,   0,   1, 0 ],
		[ 0, 0, 0, 0,    0, 255, 255,   2, 0 ],
		[ 0, 0, 0, 0,  255, 255, 255,   3, 0 ]
	];

	self.surface = e.ctx.createImageData((288 / 4), 256).data;
	self.attrs = e.ctx.createImageData((288 / 24), 256).data;

	/**
	 * Initialization of palette color table.
	 */
	self.preparePixels = function() {
		var i, j, r, g, b, y, a = (255 << 24);
		for (i = 0; i < 8; i++) {
			r = self.pal[i][4];
			g = self.pal[i][5];
			b = self.pal[i][6];
			y = Math.floor(96 - ((255 + r + g + b) / 16));

			self.pal[i][0] = a | (b << 16) | (g << 8) | r;

			r /= 1.333;
			g /= 1.333;
			b /= 1.333;

			self.pal[i][1] = a | (b << 16) | (g << 8) | r;

			r /= 2;
			g /= 2;
			b /= 2;

			self.pal[i][2] = a | (b << 16) | (g << 8) | r;
			self.pal[i][3] = a | (y << 16) | (y << 8) | y;
		}
	};

	/**
	 * Binary decoding of PMD 85 screen.
	 * @param {(Uint8Array|number[])} data with dump of PMD 85 VRAM (0xC000-0xFFFF)
	 */
	self.readPMD85vram = function(data) {
		var i, j = 0, k = 0, h = 256, dst = 0, b, c, d;
	
		if (data.length != 16384)
			return;
	
		while (h--) {
			for (i = 0; i < 48; ++i) {
				d = ((b = data[j + i]) & 0xC0) >> 6;
				c = (data[j + i + ((((h % 2) << 1) - 1) * 64)] & 0xC0) >> 6;
				c = (d | c | ((d * c) ? 0 : 4));
	
				self.surface[dst++] = (b & 0x01) ? c : 0;
				self.surface[dst++] = (b & 0x02) ? c : 0;
				self.surface[dst++] = (b & 0x04) ? c : 0;
				self.surface[dst++] = (b & 0x08) ? c : 0;
				self.surface[dst++] = (b & 0x10) ? c : 0;
				self.surface[dst++] = (b & 0x20) ? c : 0;
				self.attrs[k++] = d;
			}
	
			j += 64;
		}
	};

	/**
	 * Store PMD 85 VRAM dump to Blob URL or BASE64 data URL.
	 * @returns {string} url to Blob or BASE64 data
	 */
	self.savePMD85vram = function() {
		var baseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
			data = [], bin = e.ctx.createImageData(16, 256).data,
			i, j, k = 0, m, src = 0, base64 = '', blob, url,
			mime = 'application/octet-stream';

		for (i = 0; i < 16384; i++) {
			m = i % 3;

			if ((i % 64) < 48)
				bin[i] = data[m] =
					(self.surface[src++] ? 0x01 : 0) |
					(self.surface[src++] ? 0x02 : 0) |
					(self.surface[src++] ? 0x04 : 0) |
					(self.surface[src++] ? 0x08 : 0) |
					(self.surface[src++] ? 0x10 : 0) |
					(self.surface[src++] ? 0x20 : 0) |
					(self.attrs[k++] << 6);
			else
				bin[i] = data[m] = 0;

			if (m == 2) {
				j = (data[0] << 16) | (data[1] << 8) | data[2];
				base64 +=
					baseChars.charAt(j >> 18) +
					baseChars.charAt((j >> 12) & 0x3f) +
					baseChars.charAt((j >> 6) & 0x3f) +
					baseChars.charAt(j & 0x3f);
			}
		}

		// simplification for 16384 bytes ;)
		j = (data[0] << 16);
		base64 += baseChars.charAt(j >> 18) + baseChars.charAt((j >> 12) & 0x3f) + "==";

		try {
			blob = new Blob([ bin ], { type: mime });
		}
		catch(e) {
			console.error(e);

			try {
				blob = new (window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder);
				blob.append(bin);
				blob = blob.getBlob(mime);
			}
			catch(e) {
				console.error(e);
				blob = null;
			}
		}

		if (blob) {
			try {
				url = (window.URL || window.webkitURL).createObjectURL(blob) + '';
			}
			catch(e) {
				console.error(e);
				url = null;
			}
		}

		return url || 'data:application/octet-stream;base64,' + data.BASE64;
	};

	/**
	 * Returns nonzero if we need to show grid for exact X coordinate.
	 * @param {number} x coordinate in surface (0-287)
	 */
	self.isGrid = function(x) { return (e.showGrid && ((x % 6) == 5)) ? 3 : 0; }

	/**
	 * Main render callback of Scroller.
	 * @param {number} left Absolute X Scroller position
	 * @param {number} top Absolute Y Scroller position
	 * @param {number} zoom Scroller internal zoom factor
	 */
	self.render = function(left, top, zoom) {
		var i, j, k, x = 0, y = 0, z = 0,
			l = Math.max(Math.floor(left / zoom), 0),
			t = Math.max(Math.floor(top / zoom), 0);

		scrollerX = l * zoom;
		scrollerY = t * zoom;

		if (zoom != currentZoom) {
			e.zoomFactor = currentZoom = zoom;
			bmpW = e.canvas.width = Math.min(288 * zoom, e.contentWidth);
			bmpH = e.canvas.height = Math.min(256 * zoom, e.contentHeight);

			bmp = e.ctx.createImageData(bmpW, bmpH);
			bmpBuffer = new ArrayBuffer(bmp.data.length);
			bmpClamp = new Uint8ClampedArray(bmpBuffer);
			bmpDWORD = new Uint32Array(bmpBuffer);
		}

		for (i = t; i < 256; i++) {
			x = 0;
			for (j = l, k = ((i * 288) + j); j < 288; j++, k++) {
				self.scalers[zoom](z + x, self.pal[self.surface[k]], self.isGrid(j));

				x += zoom;
				if (x >= bmpW)
					break;
			}

			y += zoom;
			z += zoom * bmpW;
			if (y >= bmpH)
				break;
		}

		bmp.data.set(bmpClamp);
		e.ctx.putImageData(bmp, 0, 0);
	};

	/**
	 * Redraws a selected rectangle region of the surface.
	 * @param {number} x coordinate in surface (0-287)
	 * @param {number} y coordinate in surface (0-255)
	 * @param {number} w width of redraw window
	 * @param {number} h height of redraw window
	 * @param {boolean} [refreshAttributes] Refresh color from attributes.
	 */
	self.redrawRect = function(x, y, w, h, refreshAttributes) {
		var i, j, k, c, d, sx, sy, z, bx, by;

		z = (sy = (y * currentZoom) - scrollerY) * bmpW;
		for (i = y; i < (y + h); i++) {
			sx = (x * currentZoom) - scrollerX;
			for (j = x, k = ((i * 288) + j); j < (x + w); j++, k++) {
				c = self.surface[k];
				if (refreshAttributes && c) {
					d = (Math.floor((i * 48) + Math.floor(j / 6)));
					c = d + ((i & 1) ? -48 : 48);

					d = self.attrs[d];
					c = self.attrs[c];
					c = (d | c | ((d * c) ? 0 : 4));
					self.surface[k] = c;
				}

				if (sx >= 0 && sy >= 0) {
					self.scalers[currentZoom](z + sx, self.pal[c], self.isGrid(j));

					if (bx === undefined)
						bx = sx, by = sy;
				}

				sx += currentZoom;
				if (sx >= bmpW)
					break;
			}

			sy += currentZoom;
			z += currentZoom * bmpW;
			if (sy >= bmpH)
				break;
		}

		bmp.data.set(bmpClamp);
		if (bx !== undefined) {
			sx -= bx;
			sy -= by;
			e.ctx.putImageData(bmp, 0, 0, bx, by, sx, sy);
		}
	};

	/**
	 * Putting pixel onto surface in specified color and mode.
	 * @param {number} x coordinate in surface (0-287)
	 * @param {number} y coordinate in surface (0-255)
	 * @param {number} mode 0 = reset, 1 = set, 2 = toggle, 3 = only color
	 * @param {number} color 0 = no color change, 1 - 7 change to palette color
	 */
	self.putPixel = function(x, y, mode, color) {
		var i, j, x, y, column, c, d, a1, a2;

		if (x < 0 || x >= 288 || y < 0 || y >= 256 ||
			mode < 0 || mode >= 4 || color < 0 || color >= 8)
				return false;

		column = Math.floor(x / 6);
		a1 = Math.floor((y * 48) + column);
		a2 = a1 + ((y & 1) ? -48 : 48);
		if (a1 > a2) {
			d = a2;
			a2 = a1;
			a1 = d;
		}

		if (color) {
			c = color;
			self.attrs[a1] = self.pal[c][7];
			self.attrs[a2] = self.pal[c][8];
		}
		else {
			d = self.attrs[a1];
			c = self.attrs[a2];
			c = (d | c | ((d * c) ? 0 : 4));
		}

		d = ((y * 288) + x);
		switch (mode) {
			case 0:
				c = self.surface[d] = 0;
				break;
			case 1:
				self.surface[d] = c;
				break;
			case 2:
				c = self.surface[d] = (self.surface[d] ? 0 : c);
				break;
		}

		if (color)
			self.redrawRect((column * 6), ((a1 - column) / 48), 6, 2, true);
		else {
			y = (y * currentZoom) - scrollerY;
			x = (x * currentZoom) - scrollerX;
			self.scalers[currentZoom]((y * bmpW) + x, self.pal[c], self.isGrid(x));

			bmp.data.set(bmpClamp);
			e.ctx.putImageData(bmp, 0, 0, x, y, currentZoom, currentZoom);
		}
	};

	/**
	 * Do snapshot of current screen to undo buffer.
	 * @todo not yet fully implemented
	 */
	self.doSnapshot = function() {
		var len = snapshots.push([
			self.surface.subarray(0, self.surface.length),
			self.attr.subarray(0, self.attr.length)
		]);

		if (len > e.undoLevels)
			snapshot.shift();
	};

	/**
	 * Do undo operation.
	 * @returns {boolean} operation result
	 */
	self.undo = function() {
		var u = snapshots.pop();
		if (!u)
			return false;

		self.surface.set(u[0], 0);
		self.attrs.set(u[1], 0);
		return true;
	};

	/**
	 * Scaler functions for each zoom factor separately.
	 * @type {Array} scaler functions
	 */
	self.scalers = [
		function() {},
	// 1x1
		function (p, c) {
			bmpDWORD[p] = c[0];
		},
	// 2x2
		function (p, c) {
			var a = c[0], o = bmpW - 1;

			bmpDWORD[p++] = a;
			bmpDWORD[p] = a;
			p += o;
			bmpDWORD[p++] = a;
			bmpDWORD[p] = a;
		},
	// 3x3
		function (p, c, g) {
			var a = c[0], b = c[1], o = bmpW - 2;

			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p] = a;
			p += o;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p] = b;
			p += o;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = b;
			bmpDWORD[p] = c[g | 1];
		},
	// 4x4
		function (p, c, g) {
			var a = c[0], b = c[1], d = c[2], o = bmpW - 3;

			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p] = b;
			p += o;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p] = c[g | 1];
			p += o;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p] = b;
			p += o;
			bmpDWORD[p++] = d;
			bmpDWORD[p++] = d;
			bmpDWORD[p++] = d;
			bmpDWORD[p] = c[g | 2];
		},
	// 5x5
		function (p, c, g) {
			var a = c[0], b = c[1], d = c[2], o = bmpW - 4;

			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p] = b;
			p += o;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p] = b;
			p += o;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p] = b;
			p += o;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p] = c[g | 1];
			p += o;
			bmpDWORD[p++] = d;
			bmpDWORD[p++] = d;
			bmpDWORD[p++] = d;
			bmpDWORD[p++] = d;
			bmpDWORD[p] = c[g | 2];
		},
	// 6x6
		function (p, c, g) {
			var a = c[0], b = c[1], d = c[2], e = c[g | 1], i, o = bmpW - 5;

			for (i = 0; i < 5; i++) {
				bmpDWORD[p++] = a;
				bmpDWORD[p++] = a;
				bmpDWORD[p++] = a;
				bmpDWORD[p++] = a;
				bmpDWORD[p++] = a;
				bmpDWORD[p] = (i & 1) ? e : b;
				p += o;
			}

			bmpDWORD[p++] = d;
			bmpDWORD[p++] = d;
			bmpDWORD[p++] = d;
			bmpDWORD[p++] = d;
			bmpDWORD[p++] = d;
			bmpDWORD[p] = c[g | 2];
		},
	// 7x7
		function (p, c, g) {
			var a = c[0], b = c[1], d = c[2], e = c[g | 1], i, o = bmpW - 6;

			for (i = 0, e; i < 6; i++) {
				bmpDWORD[p++] = a;
				bmpDWORD[p++] = a;
				bmpDWORD[p++] = a;
				bmpDWORD[p++] = a;
				bmpDWORD[p++] = a;
				bmpDWORD[p++] = a;
				bmpDWORD[p] = (i == 3) ? e : b;
				p += o;
			}

			bmpDWORD[p++] = d;
			bmpDWORD[p++] = d;
			bmpDWORD[p++] = d;
			bmpDWORD[p++] = d;
			bmpDWORD[p++] = d;
			bmpDWORD[p++] = d;
			bmpDWORD[p] = c[g | 2];
		},
	// 8x8
		function (p, c, g) {
			var a = c[0], b = c[1], d = c[2], e = c[g | 1], i, j, o = bmpW - 7;

			for (i = 0; i < 7; i++) {
				for (j = 0; j < 7; j++)
					bmpDWORD[p++] = a;
				bmpDWORD[p] = (i & 1) ? e : b;
				p += o;
			}

			for (j = 0; j < 7; j++)
				bmpDWORD[p++] = d;
			bmpDWORD[p] = c[g | 2];
		},
	// 9x9
		function (p, c, g) {
			var a = c[0], b = c[1], d = c[2], e = c[g | 1], i, j, o = bmpW - 8;

			for (i = 0; i < 8; i++) {
				for (j = 0; j < 8; j++)
					bmpDWORD[p++] = a;
				bmpDWORD[p] = (j == 2 || j == 5) ? e : b;
				p += o;
			}

			for (j = 0; j < 8; j++)
				bmpDWORD[p++] = d;
			bmpDWORD[p] = c[g | 2];
		},
	]

	return self;
};

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

/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Handler - translate mouse handlers to function by selected function
 *
 * Copyright (c) 2012-2014 Martin Borik
 */

ColorAceEditor.Handler = function(e) {
	var self = {}, draw = e.draw;

	self.mouseMove = function(o) {
		if (o.lx != o.x || o.ly != o.y)
			draw.line(o.lx, o.ly, o.x, o.y, o.mov);
	}

	self.mouseUp = function(o) {
		if (o.mov)
			draw.dot(o.x, o.y);
		else if (o.lx != o.x || o.ly != o.y)
			draw.line(o.lx, o.ly, o.x, o.y, true);
	}

	return self;
};

/*
 * PMD 85 ColorAce picture editor
 * onReady initialization and entry point
 *
 * Copyright (c) 2012-2014 Martin Borik
 */

var editor = null, mousedown = 0, notmoved = false,
	lastPixelX = -1, lastPixelY = -1;

//- resizing handler ----------------------------------------------------------
var resizeWrapper = function() {
	var wrapW = $(window).width(), wrapH = $(window).height();
	$('#wrapper').css({ width:  wrapW + 'px', height: wrapH + 'px' });
	$('#leftPanel').css({ height: wrapH + 'px' });
	$("#mainPanel").css({ height: wrapH + 'px' });
	editor.setDimensions($("#mainPanel").width(), wrapH);
};

//-----------------------------------------------------------------------------
$(document).ready(function() {
	editor = new ColorAceEditor({
		canvas : $("#myCanvas")[0],
		grid   : true,
		undo   : 20
	});

	resizeWrapper();
	$(window).resize(resizeWrapper);
	$(document).bind("contextmenu", function(e) {
		e.preventDefault();
		return false
	});

	$("#mainPanel").mousewheel(function(e, delta) {
		var scrl = editor.scroller,
			zoom = editor.zoomFactor + (delta = (delta < 0 ? -1 : 1));

		if (zoom == 0 || zoom >= editor.pixel.scalers.length)
			return;

		scrl.zoomTo(scrl.__zoomLevel + delta, false, e.pageX - scrl.__clientLeft, e.pageY - scrl.__clientTop);
	});

	$("#mainPanel").mousedown(function(e) {
		if (!e) var e = window.event;
		if ((e.which && e.which > 1) || (e.button && e.button > 0)) {
			editor.scroller.doTouchStart([{
				pageX: e.pageX,
				pageY: e.pageY
			}], e.timeStamp);
			mousedown = 2;
		}
		else {
			var coords = editor.translateCoords(e.pageX, e.pageY);
			lastPixelX = coords.x;
			lastPixelY = coords.y;
			mousedown = 1;
		}

		notmoved = true;
	});

	$(document).mousemove(function(e) {
		if (mousedown == 0)
			return;
		else if (mousedown == 2) {
			editor.scroller.doTouchMove([{
				pageX: e.pageX,
				pageY: e.pageY
			}], e.timeStamp);
		}
		else {
			var coords = editor.translateCoords(e.pageX, e.pageY);

			editor.handler.mouseMove($.extend(coords, {
				lx: lastPixelX,
				ly: lastPixelY,
				mov: notmoved
			}));

			lastPixelX = coords.x;
			lastPixelY = coords.y;
		}

		notmoved = false;
	});

	$(document).mouseup(function(e) {
		if (!mousedown)
			return;

		if (!e) var e = window.event;
		if ((e.which && e.which > 1) || (e.button && e.button > 0))
			editor.scroller.doTouchEnd(e.timeStamp);
		else {
			var coords = editor.translateCoords(e.pageX, e.pageY);
		}

		lastPixelX = -1; lastPixelY = -1;
		notmoved = false;
		mousedown = 0;
	});

	$('#clear-button').button({
		icons: { primary: "ui-icon-new" },
		text: false
	}).click(function() {
		$(this).blur();
		return false;
	});

	$('#upload-button').button({
		icons: { primary: "ui-icon-load" }
	}).click(function() {
		$('#upload-file:file').click();
		$(this).blur();
		return false;
	});

	$('#upload-file:file').change(function() {
		var file = this.files[0],
			fr = new window.FileReader;

		if (fr && file) try {
			fr.onload = function() {
				var b = new Uint8Array(this.result);
				editor.pixel.readPMD85vram(b);
				editor.scroller.zoomTo(editor.zoomFactor);
			};

			fr.readAsArrayBuffer(file);
		}
		catch(e) { console.error(e); }
	});

	$('#save-button').button({
		icons: { primary: "ui-icon-save" }
	}).click(function() {
		var url = editor.pixel.savePMD85vram(),
			link = $('#save-data')[0];

		link.href = url;
		link.click();

		$(this).blur();
		return false;
	});

	$('#tools').buttonset();
	$('#tool0').button({
		icons: { primary: "ui-icon-select" },
		text: false
	});
	$('#tool1').button({
		icons: { primary: "ui-icon-select-grid" },
		text: false
	});
	$('#tool2').button({
		icons: { primary: "ui-icon-pencil" },
		text: false
	});
	$('#tool3').button({
		icons: { primary: "ui-icon-brush" },
		text: false
	});
	$('#tool4').button({
		icons: { primary: "ui-icon-fill" },
		text: false
	});
	$('#tool5').button({
		icons: { primary: "ui-icon-lines" },
		text: false
	});
	$('#tool6').button({
		icons: { primary: "ui-icon-ellipse" },
		text: false
	});
	$('#tool7').button({
		icons: { primary: "ui-icon-rectangle" },
		text: false
	});

	$('#colors').buttonset();
	$('#drawing-mode').buttonset();

	$("#colors > input:radio").click(function() {
		editor.editColor = parseInt(this.value);
		return false;
	});
	$("#drawing-mode > input:radio").click(function() {
		editor.editMode = parseInt(this.value);
		return false;
	});
});
