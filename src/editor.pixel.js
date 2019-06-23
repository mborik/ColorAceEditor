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
