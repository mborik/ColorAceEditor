/*!
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Pixelator - canvas level methods
 *
 * Copyright (c) 2012 Martin Borik
 */

ColorAceEditor.Pixelator = function(e) {
	var self = {}, currentZoom = 0, scrollerX = 0, scrollerY = 0,
		snapshots = [];

	self.pal = [
		//  pixels       R    G    B    attr
		[ null, null,    0,   0,   0,   0, 0 ],
		[ null, null,  255,   0,   0,   1, 1 ],
		[ null, null,    0,   0, 255,   2, 2 ],
		[ null, null,  255,   0, 255,   3, 3 ],
		[ null, null,    0, 255,   0,   0, 0 ],
		[ null, null,  255, 255,   0,   1, 0 ],
		[ null, null,    0, 255, 255,   2, 0 ],
		[ null, null,  255, 255, 255,   3, 0 ]
	];

	self.surface = e.ctx.createImageData((288 / 4), 256).data;
	self.attrs = e.ctx.createImageData((288 / 24), 256).data;

	/**
	 * Binary decoding of PMD 85 screen.
	 * @param data Uint8Array or Array with dump of PMD 85 VRAM (0xC000-0xFFFF)
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
	 * save PMD 85 VRAM dump to Blob URL or BASE64 data URL.
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
	 * Initialization of ImageData pixel for each palette color.
	 * @param zoom Zoom factor
	 */
	self.preparePixels = function(zoom) {
		var i, j, d1, d2;
		for (i = 0; i < 8; i++) {
			self.pal[i][0] = e.ctx.createImageData(zoom, zoom);
			d1 = self.pal[i][0].data;

			self.pal[i][1] = e.ctx.createImageData(zoom, zoom);
			d2 = self.pal[i][1].data;

			for (j = 0; j < (zoom * zoom * 4); j += 4) {
				if (zoom > 3 && ((j % (zoom * 4)) == ((zoom - 1) * 4))) {
					d1[j + 0] = self.pal[i][2] / 1.33;
					d1[j + 1] = self.pal[i][3] / 1.33;
					d1[j + 2] = self.pal[i][4] / 1.33;
					d2[j + 0] = d2[j + 1] = d2[j + 2] = (96 - ((255 + self.pal[i][2] + self.pal[i][3] + self.pal[i][4]) / 16));
				}
				else if (zoom > 3 && (j > (zoom * (zoom - 1) * 4))) {
					d1[j + 0] = d2[j + 0] = self.pal[i][2] / 2.66;
					d1[j + 1] = d2[j + 1] = self.pal[i][3] / 2.66;
					d1[j + 2] = d2[j + 2] = self.pal[i][4] / 2.66;
				}
				else {
					d1[j + 0] = d2[j + 0] = self.pal[i][2];
					d1[j + 1] = d2[j + 1] = self.pal[i][3];
					d1[j + 2] = d2[j + 2] = self.pal[i][4];
				}

				d1[j + 3] = d2[j + 3] = 255;
			}
		}
	};

	/**
	 * Main render callback of Scroller.
	 * @param left Absolute X Scroller position
	 * @param top Absolute Y Scroller position
	 * @param zoom Scroller internal zoom factor
	 */
	self.render = function(left, top, zoom) {
		var i, j, f, x = 0, y = 0;

		scrollerX = Math.max(Math.floor(left / zoom), 0) * zoom;
		scrollerY = Math.max(Math.floor(top / zoom), 0) * zoom;

		if (zoom != currentZoom) {
			self.preparePixels(zoom);
			e.zoomFactor = currentZoom = zoom;
			e.canvas.width = Math.min(288 * zoom, e.contentWidth);
			e.canvas.height = Math.min(256 * zoom, e.contentHeight);
		}

		for (i = Math.max(Math.floor(top / zoom), 0); i < 256; i++) {
			x = 0;
			for (j = Math.max(Math.floor(left / zoom), 0); j < 288; j++) {
				f = ((zoom > 3 && ((j % 6) == 5) && e.showGrid) ? 1 : 0);
				e.ctx.putImageData(self.pal[(self.surface[((i * 288) + j)])][f], x, y);
				x += zoom;
				if (x >= e.contentWidth)
					break;
			}

			y += zoom;
			if (y >= e.contentHeight)
				break;
		}
	};

	/**
	 * Redraws a selected rectangle region of the surface.
	 * @param refreshAttributes (optional) Refresh color from attributes.
	 */
	self.redrawRect = function(x, y, w, h, refreshAttributes) {
		var i, j, c, d, f, sx, sy;

		sy = (y * currentZoom) - scrollerY;
		for (i = y; i < (y + h); i++) {
			sx = (x * currentZoom) - scrollerX;
			for (j = x; j < (x + w); j++) {
				f = ((i * 288) + j);
				c = self.surface[f];
				if (refreshAttributes && c) {
					d = (Math.floor((i * 48) + Math.floor(j / 6)));
					c = d - ((((i % 2) << 1) - 1) * 48);

					d = self.attrs[d];
					c = self.attrs[c];
					c = (d | c | ((d * c) ? 0 : 4));
					self.surface[f] = c;
				}

				f = ((currentZoom > 3 && ((j % 6) == 5) && e.showGrid) ? 1 : 0);
				if (sx >= 0 && sy >= 0)
					e.ctx.putImageData(self.pal[c][f], sx, sy);

				sx += currentZoom;
				if (sx >= e.contentWidth)
					break;
			}

			sy += currentZoom;
			if (sy >= e.contentHeight)
				break;
		}
	};

	/**
	 * Putting pixel onto surface in specified color and mode.
	 * @param x coordinate in surface (0-287)
	 * @param y coordinate in surface (0-255)
	 * @param mode 0 = reset, 1 = set, 2 = toggle, 3 = only color
	 * @param color 0 = no color change, 1 - 7 change to palette color
	 */
	self.putPixel = function(x, y, mode, color) {
		var i, j, x, y, column, c, d, a1, a2;

		if (x < 0 || x >= 288 || y < 0 || y >= 256 ||
			mode < 0 || mode >= 4 || color < 0 || color >= 8)
				return false;

		column = Math.floor(x / 6);
		a1 = Math.floor((y * 48) + column);
		a2 = a1 - ((((y % 2) << 1) - 1) * 48);
		if (a1 > a2) {
			d = a2;
			a2 = a1;
			a1 = d;
		}

		if (color) {
			c = color;
			self.attrs[a1] = self.pal[c][5];
			self.attrs[a2] = self.pal[c][6];
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
			d = ((currentZoom > 3 && ((x % 6) == 5) && e.showGrid) ? 1 : 0);
			x = (x * currentZoom) - scrollerX;
			y = (y * currentZoom) - scrollerY;
			e.ctx.putImageData(self.pal[c][d], x, y);
		}
	};

	self.doSnapshot = function() {
		var len = snapshots.push([
			self.surface.subarray(0, self.surface.length),
			self.attr.subarray(0, self.attr.length)
		]);

		if (len > e.undoLevels)
			snapshot.shift();
	};

	self.undo = function() {
		var u = snapshots.pop();
		if (!u)
			return false;

		self.surface.set(u[0], 0);
		self.attrs.set(u[1], 0);
		return true;
	};

	return self;
};
