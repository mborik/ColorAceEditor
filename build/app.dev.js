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

	this.contentWidth  = 0;
	this.contentHeight = 0;

	this.statusBar  = opt.status;
	this.zoomFactor = opt.zoom || 1;
	this.showGrid   = opt.grid || true;
	this.undoLevels = opt.undo || 10;
	this.editColor  = 0;
	this.editTool   = 2;
	this.editMode   = 2;
	this.editSelect = 0;
	this.editFilled = false;

	this.pixel      = ColorAceEditor.Pixelator(this);
	this.draw       = ColorAceEditor.Drawing(this);
	this.handler    = ColorAceEditor.Handler(this);
	this.uploader   = ColorAceEditor.Uploader(this, opt.upload);

	this.selection  = ColorAceEditor.Selection(this);
	this.selectionCallback = function(state) {
		for (var i = 2; i < 8; i++)
			$('#select' + i).button('option', 'disabled', !state);
	};

	this.pixel.preparePixels();
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
	 * @param {number} w - webpage workspace width
	 * @param {number} h - webpage workspace height
	 */
	this.setDimensions = function(w, h) {
		this.contentWidth  = w;
		this.contentHeight = h;
		this.scroller.setDimensions(w - 276, h, 288, 256);
	};

	/**
	 * Translation of "real world" coordinates on page to our pixel space.
	 * @param {number} sx - real mouse cursor X position
	 * @param {number} sy - real mouse cursor X position
	 * @return {object} object with properties 'x', 'y' and 'column'
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
			a = (49152 + (y * 64) + c).toString(16).toUpperCase() + 'h',
			z = this.zoomFactor * 100,
			pad = function(num, len) {
				num = '    ' + num;
				return num.substr(num.length - len);
			};

		this.statusBar.text(pad(z, 4) + '%   X:' + pad(x, 3) + ' Y:' + pad(y, 3) + '  C:' + pad(c, 2) + '   ' + a);
	};
}

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
		var i, r, g, b, y, a = (255 << 24);
		for (i = 0; i < 8; i++) {
			r = self.pal[i][4];
			g = self.pal[i][5];
			b = self.pal[i][6];
			y = Math.floor(96 - ((255 + r + g + b) / 16));

			self.pal[i][0] = a | (b << 16) | (g << 8) | r;

			r = (r / 1.6) + 32;
			g = (g / 1.6) + 32;
			b = (b / 1.6) + 32;

			self.pal[i][1] = a | (b << 16) | (g << 8) | r;

			r = (r / 2.4) + 16;
			g = (g / 2.4) + 16;
			b = (b / 2.4) + 16;

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

		try { blob = new Blob([ bin ], { type: mime }); }
		catch(ex) {
			console.error(ex);

			try {
				var bb = (window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder);
				bb = new bb();
				bb.append(bin);
				blob = bb.getBlob(mime);
			}
			catch(ex2) {
				console.error(ex2);
				blob = null;
			}
		}

		if (blob) {
			try { url = (window.URL || window.webkitURL).createObjectURL(blob) + ''; }
			catch(ex) {
				console.error(ex);
				url = null;
			}
		}

		return url || 'data:application/octet-stream;base64,' + base64;
	};

	/**
	 * Returns nonzero if we need to show grid for exact X coordinate.
	 * @param {number} x coordinate in surface (0-287)
	 */
	self.isGrid = function(x) { return (e.showGrid && ((x % 6) == 5)) ? 3 : 0; };

	/**
	 * Main render callback of Scroller.
	 * @param {number} left Absolute X Scroller position
	 * @param {number} top Absolute Y Scroller position
	 * @param {number} zoom Scroller internal zoom factor
	 */
	self.render = function(left, top, zoom) {
		var i, j, k, s, x = 0, y = 0, z = 0, w,
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

		for (i = t, w = bmpW - zoom; i < 256; i++) {
			x = 0;
			for (j = l, k = ((i * 288) + j); j < 288; j++, k++) {
				self.scalers[zoom](z + x, self.pal[self.surface[k]], self.isGrid(j));

				if ((s = e.selection.testBoundsX(j, i)))
					self.marqueeX(z + x + (--s * (zoom - 1)), zoom, y);
				if ((s = e.selection.testBoundsY(j, i)))
					self.marqueeY(z + x + (--s * (zoom - 1) * bmpW), zoom, x);

				x += zoom;
				if (x > w)
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
		var i, j, k, c, d, s, sx, sy, sz, sw, bx, by;

		sw = bmpW - currentZoom;
		sz = (sy = (y * currentZoom) - scrollerY) * bmpW;
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
					self.scalers[currentZoom](sz + sx, self.pal[c], self.isGrid(j));

					if ((s = e.selection.testBoundsX(j, i)))
						self.marqueeX(sz + sx + (--s * (currentZoom - 1)), currentZoom, sy);
					if ((s = e.selection.testBoundsY(j, i)))
						self.marqueeY(sz + sx + (--s * (currentZoom - 1) * bmpW), currentZoom, sx);

					if (bx === undefined) {
						bx = sx;
						by = sy;
					}
				}

				sx += currentZoom;
				if (sx > sw)
					break;
			}

			sy += currentZoom;
			sz += currentZoom * bmpW;
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

	self.redrawSelection = function(callback) {
		var x1 = e.selection.x1, y1 = e.selection.y1,
			x2 = e.selection.x2, y2 = e.selection.y2;

		callback(e.selection);
		self.redrawRect(x1, y1, x2, y2, false);
	};

	/**
	 * Putting pixel onto surface in specified color and mode.
	 * @param {number} x coordinate in surface (0-287)
	 * @param {number} y coordinate in surface (0-255)
	 * @param {number} mode 0 = reset, 1 = set, 2 = toggle, 3 = only color
	 * @param {number} color 0 = no color change, 1 - 7 change to palette color
	 */
	self.putPixel = function(x, y, mode, color) {
		var column, c, d, a1, a2;

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
	 * Draw marquee for X coordinate.
	 * @param  {number} p pointer to bitmap
	 * @param  {number} z zoom factor
	 * @param  {number} y coordinate
	 */
	self.marqueeX = function(p, z, y) {
		var a = 0xFFFFFFFF, b = 0x302010, i;
		for (i = 0; i < z; i++, y++) {
			bmpDWORD[p] = (y & 4) ? a : (bmpDWORD[p] | b);
			p += bmpW;
		}
	};

	/**
	 * Draw marquee for Y coordinate.
	 * @param  {number} p pointer to bitmap
	 * @param  {number} z zoom factor
	 * @param  {number} x coordinate
	 */
	self.marqueeY = function(p, z, x) {
		var a = 0xFFFFFFFF, b = 0x302010, i;
		for (i = 0; i < z; i++, x++, p++)
			bmpDWORD[p] = (x & 4) ? a : (bmpDWORD[p] | b);
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
			var a = c[0], o = bmpW - 2;

			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p] = a;
			p += o;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p] = a;
			p += o;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p] = c[g];
		},
	// 4x4
		function (p, c, g) {
			var a = c[0], b = c[g | 1], o = bmpW - 3;

			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p] = a;
			p += o;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p] = a;
			p += o;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p] = a;
			p += o;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = a;
			bmpDWORD[p] = b;
		},
	// 5x5 disabled
		null,
	// 6x6
		function (p, c, g) {
			var a = c[0], b = c[1], d = c[g | 1], i, o = bmpW - 5;

			for (i = 0; i < 5; i++) {
				bmpDWORD[p++] = a;
				bmpDWORD[p++] = a;
				bmpDWORD[p++] = a;
				bmpDWORD[p++] = a;
				bmpDWORD[p++] = a;
				bmpDWORD[p] = (i & 1) ? d : ((i % 2) ? b : a);
				p += o;
			}

			bmpDWORD[p++] = a;
			bmpDWORD[p++] = b;
			bmpDWORD[p++] = a;
			bmpDWORD[p++] = b;
			bmpDWORD[p++] = a;
			bmpDWORD[p] = d;
		},
	// 7x7 disabled
		null,
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
	// 9x9 disabled
		null,
	// 10x10
		function (p, c, g) {
			var a = c[0], b = c[1], d = c[2], e = c[g | 1], i, j, o = bmpW - 9;

			for (i = 0; i < 9; i++) {
				for (j = 0; j < 9; j++)
					bmpDWORD[p++] = a;
				bmpDWORD[p] = (i & 1) ? e : b;
				p += o;
			}

			for (j = 0; j < 9; j++)
				bmpDWORD[p++] = d;
			bmpDWORD[p] = c[g | 2];
		},
	// 11x11 disabled
		null,
	// 12x12
		function (p, c, g) {
			var a = c[0], b = c[1], d = c[g | 1], i, j, o = bmpW - 11;

			for (i = 0; i < 11; i++) {
				for (j = 0; j < 11; j++)
					bmpDWORD[p++] = a;
				bmpDWORD[p] = (i & 1) ? d : b;
				p += o;
			}

			for (j = 0; j < 11; j++)
				bmpDWORD[p++] = 11;
			bmpDWORD[p] = c[g | 2];
		},
	// 13x13 disabled
		null,
	// 14x14
		function (p, c, g) {
			var a = c[0], b = c[1], d = c[g | 1], i, j, o = bmpW - 13;

			for (i = 0; i < 13; i++) {
				for (j = 0; j < 13; j++)
					bmpDWORD[p++] = a;
				bmpDWORD[p] = (i & 1) ? d : b;
				p += o;
			}

			for (j = 0; j < 13; j++)
				bmpDWORD[p++] = 13;
			bmpDWORD[p] = c[g | 2];
		},
	// 15x15 disabled
		null,
	// 16x16
		function (p, c, g) {
			var a = c[0], b = c[1], d = c[g | 1], i, j, o = bmpW - 15;

			for (i = 0; i < 15; i++) {
				for (j = 0; j < 15; j++)
					bmpDWORD[p++] = a;
				bmpDWORD[p] = (i & 1) ? d : b;
				p += o;
			}

			for (j = 0; j < 15; j++)
				bmpDWORD[p++] = 15;
			bmpDWORD[p] = c[g | 2];
		}
	];

	return self;
};

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

/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Uploader - processing of uploaded file
 *
 * Copyright (c) 2019 Martin Borik
 */

ColorAceEditor.Uploader = function(editor, canvas) {
	if (!$(canvas).is("canvas"))
		throw "ColorAceEditor: Image render canvas element not defined!";

	var ctx = canvas.getContext("2d");
	var getPixelValue = function(x, y) {
		var pix = ctx.getImageData(x, y, 1, 1).data;
		return Math.round((
			Math.round(pix[0] * 299) +
			Math.round(pix[1] * 587) +
			Math.round(pix[2] * 114)
		) / 1000);
	};

	return function(file, callback) {
		if (!file)
			return;

		try {
			var fr = new window.FileReader();

			if (typeof file.type === 'string' && file.type.indexOf('image/') === 0) {
				fr.onload = function() {
					var img = new Image();

					img.onload = function() {
						if (img.width > 288 || img.height > 256)
							callback({ error: 'invalid image dimensions' });

						canvas.width = img.width;
						canvas.height = img.height;
						ctx.drawImage(img, 0, 0);

						for (var y = 0; y < img.height; y++) {
							for (var x = 0; x < img.width; x++) {
								editor.pixel.surface[(y * 288) + x] = getPixelValue(x, y) ? 7 : 0;
							}
						}

						editor.scroller.zoomTo(editor.zoomFactor);

						img = null;
						callback({ success: true });
					};

					img.src = this.result;
				};

				fr.readAsDataURL(file);
			}
			else if (file.size === 16384) {
				fr.onload = function() {
					var b = new Uint8Array(this.result);
					editor.pixel.readPMD85vram(b);
					editor.scroller.zoomTo(editor.zoomFactor);

					callback({ success: true });
				};

				fr.readAsArrayBuffer(file);
			}
			else callback({ error: 'not an image file or PMD-85 screen' });
		}
		catch (e) { console.error(e); }
	};
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
		upload : $("#upload-canvas")[0],
		status : $("#statusBar"),
		grid   : true,
		undo   : 20
	});

	resizeWrapper();
	$(window).resize(resizeWrapper);
	$(document).bind("contextmenu", function(e) {
		e.preventDefault();
		return false;
	});

	$("#mainPanel").mousewheel(function(e, delta) {
		var scrl = editor.scroller,
			zoom = editor.zoomFactor + (delta = (delta < 0 ? -1 : 1));

		if (zoom < 1 || zoom > 16)
			return;
		else if (editor.pixel.scalers[zoom] === null)
			delta *= 2;

		scrl.zoomTo(scrl.__zoomLevel + delta, false, e.pageX - scrl.__clientLeft, e.pageY - scrl.__clientTop);
		editor.redrawStatusBar(e.pageX, e.pageY);
	});

	$("#mainPanel").mousedown(function(e) {
		if (!e) e = window.event;
		if ((e.which && e.which > 1) || (e.button && e.button > 0)) {
			editor.scroller.doTouchStart([{
				pageX: e.pageX,
				pageY: e.pageY
			}], e.timeStamp);
			mousedown = 2;
		}
		else {
			var coords = editor.translateCoords(e.pageX, e.pageY);
			editor.handler.mouseDown($.extend(coords, {
				lx: lastPixelX,
				ly: lastPixelY,
				mov: true
			}));

			lastPixelX = coords.x;
			lastPixelY = coords.y;
			mousedown = 1;
		}

		notmoved = true;
	});

	$(document).mousemove(function(e) {
		editor.redrawStatusBar(e.pageX, e.pageY);

		if (mousedown === 0)
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

		if (!e) e = window.event;
		if ((e.which && e.which > 1) || (e.button && e.button > 0))
			editor.scroller.doTouchEnd(e.timeStamp);
		else {
			var coords = editor.translateCoords(e.pageX, e.pageY);
			editor.handler.mouseUp($.extend(coords, {
				lx: lastPixelX,
				ly: lastPixelY,
				mov: notmoved
			}));
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
		editor.uploader(this.files[0], function(result) {
			$('#upload-file:file').val('');

			if (typeof result === 'object' && result.error) {
				$('<div title="upload error">' + result.error + '</div>')
					.dialog({ modal: true, buttons: ['ok'] });
			}
		});
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
	$('#colors').buttonset();
	$('#drawing-mode').buttonset();
	$('#select-func').buttonset();

	$.each({
		'tool0': 'select',
		'tool1': 'select-grid',
		'tool2': 'pencil',
		'tool3': 'brush',
		'tool4': 'fill',
		'tool5': 'lines',
		'tool6': 'ellipse',
		'tool7': 'rectangle',
		'select0': 'select',
		'select1': 'resize',
		'select2': 'select-cut',
		'select3': 'select-move',
		'select4': 'select-copy',
		'select5': 'select-invert',
		'select6': 'select-flip-x',
		'select7': 'select-flip-y',
		'fillmode': 'fill'
	}, function(index, val) {
		$('#' + index).button({
			icons: { primary: 'ui-icon-' + val },
			text: false
		});
	});

	$('#tool' + editor.editTool).click();
	$('#mode' + editor.editMode).click();
	$('#color' + editor.editColor).click();
	$('#select' + editor.editSelect).click();
	$('#filling-mode').hide();
	$('#select-func').hide();
	editor.selectionCallback(false);

	$("#colors>input:radio").click(function() {
		editor.editColor = parseInt(this.value);
		return false;
	});
	$("#tools>input:radio").click(function() {
		editor.editTool = parseInt(this.value);

		if (editor.editTool > 5)
			$('#filling-mode').show();
		else {
			$('#filling-mode').hide();

			if (editor.editTool < 2) {
				$('#select-func').show();
				$('#drawing-set').hide();
			}
			else {
				$('#select-func').hide();
				$('#drawing-set').show();
			}
		}

		return false;
	});
	$("#drawing-mode>input:radio").click(function() {
		editor.editMode = parseInt(this.value);
		return false;
	});
	$("#select-func>input:radio").click(function() {
		editor.editSelect = parseInt(this.value);

		if (editor.selection.nonEmpty() && editor.editSelect > 0) {
			editor.handler.selectFunction();
			if (editor.editSelect < 3 || editor.editSelect > 4) {
				$('input#select0').click();
				editor.editSelect = 0;
			}
		}

		return false;
	});
	$("#filling-mode>input:checkbox").change(function() {
		editor.editFilled = this.checked;
		return false;
	});

	// keyboard handling
	$(window).on('keydown', function(e) {
		if (e.target && (/^a|input|button$/i.test(e.target.tagName)))
			return true;

		var key = e.which || e.charCode || e.keyCode;

		// F9 - dialog pomocky na oznacovanie bodov...
		if (key === 120 && editor.a80data instanceof Array) {
			var txt = editor.a80data.map(function(v) {
				return "\t\tdb\t" + v.x + ", " + v.y;
			}).join('\n');

			$('<textarea />')
				.val(txt)
				.dialog({
					width: 800,
					height: 800,
					modal: true
				})
				.css({
					fontFamily: 'monospace',
					width: 760,
					height: 760
				});

			txt = null;
		}
		// Backspace - odobratie posledne pridaneho bodu
		else if (key === 8 && editor.a80data instanceof Array) {
			var last = editor.a80data.pop();
			if (last)
				editor.draw.dot(last.x, last.y);
		}
		// G - show/hide grid
		else if (key === 71) {
			editor.showGrid = !editor.showGrid;
			editor.scroller.zoomTo(editor.zoomFactor);
		}
		else
			return true;

		e.preventDefault();
		return false;
	});
});
