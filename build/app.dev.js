/*!
 * PMD 85 ColorAce picture editor
 * ColorAceEditor class
 *
 * Copyright (c) 2012 Martin Borik
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
	this.draw  = ColorAceEditor.Drawing(this);
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

/*!
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Drawing - custom artistic methods
 *
 * Copyright (c) 2012 Martin Borik
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

/*!
 * PMD 85 ColorAce picture editor
 * onReady initialization and entry point
 *
 * Copyright (c) 2014 Martin Borik
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
		var self = editor.scroller;
		self.zoomTo(self.__zoomLevel + (delta < 0 ? -1 : 1), false,
			e.pageX - self.__clientLeft, e.pageY - self.__clientTop);
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
			if (lastPixelX != coords.x || lastPixelY != coords.y)
				editor.draw.line(lastPixelX, lastPixelY, coords.x, coords.y, notmoved);

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
			if (notmoved)
				editor.draw.dot(coords.x, coords.y);
			else if (lastPixelX != coords.x || lastPixelY != coords.y)
				editor.draw.line(lastPixelX, lastPixelY, coords.x, coords.y, true);
		}

		lastPixelX = -1; lastPixelY = -1;
		notmoved = false;
		mousedown = 0;
	});

	$('#clear-button').button({
		icons: { primary: "ui-icon-new" },
		text: false
	});

	$('#upload-button').button({
		icons: { primary: "ui-icon-load" }
	}).click(function() {
		$('#upload-file:file').click();
		return false;
	});

	$('#upload-file:file').change(function() {
		var file = this.files[0],
			fr = window.FileReader;

			if (fr) try {
				fr.onload = function() {
					var b = this.result,
						a = new Uint8Array(b);
					editor.pixel.readPMD85vram(a);
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
		return true;
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
