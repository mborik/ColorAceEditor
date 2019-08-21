/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Pixelator - canvas level methods
 *
 * Copyright (c) 2012-2014 Martin Borik
 */

import { editor } from "./Editor";


const FULL_ALPHA = 0xFFFFFFFF;
const MARQUEE_COLOR = 0x302010;

export class Pixelator {
	private currentZoom: number = 0;
	private scrollerX: number = 0;
	private scrollerY: number = 0;
	private bmp: ImageData = null;
	private bmpW: number = null;
	private bmpH: number = null;
	private bmpClamp: Uint8ClampedArray = null;
	private bmpDWORD: Uint32Array = null;

	snapshots = [];
	pal = [
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

	surface: Uint8ClampedArray = null;
	attrs: Uint8ClampedArray = null;

	/**
	 * Initialization of palette color table.
	 */
	constructor() {
		const a: number = (255 << 24);

		for (let i = 0; i < 8; i++) {
			let r = this.pal[i][4];
			let g = this.pal[i][5];
			let b = this.pal[i][6];
			let y = Math.floor(96 - ((255 + r + g + b) / 16));

			this.pal[i][0] = a | (b << 16) | (g << 8) | r;

			r = (r / 1.6) + 32;
			g = (g / 1.6) + 32;
			b = (b / 1.6) + 32;

			this.pal[i][1] = a | (b << 16) | (g << 8) | r;

			r = (r / 2.4) + 16;
			g = (g / 2.4) + 16;
			b = (b / 2.4) + 16;

			this.pal[i][2] = a | (b << 16) | (g << 8) | r;
			this.pal[i][3] = a | (y << 16) | (y << 8) | y;
		}
	}

	/**
	 * Binary decoding of PMD 85 screen.
	 * @param {(Uint8Array|number[])} videoRam with dump of PMD 85 VRAM (0xC000-0xFFFF)
	 */
	readPMD85vram(videoRam: Uint8Array | number[]) {
		if (videoRam.length !== 16384) {
			return;
		}

		let vramptr = 0;
		let ptr = 0, atptr = 0;
		let h: number = 256;
		let i: number, c: number;
		let bt: number, bt2: number;
		let at: number, at2: number;

		while (h--) {
			for (i = 0; i < 48; i++, vramptr++) {
				bt = videoRam[vramptr];
				at = (bt & 0xC0) >> 6;

				bt2 = videoRam[vramptr + ((h & 1) ? 64 : -64)];
				at2 = (bt2 & 0xC0) >> 6;

				c = at | at2 | ((at & at2) ? 0 : 4);

				this.surface[ptr++] = (bt & 0x01) ? c : 0;
				this.surface[ptr++] = (bt & 0x02) ? c : 0;
				this.surface[ptr++] = (bt & 0x04) ? c : 0;
				this.surface[ptr++] = (bt & 0x08) ? c : 0;
				this.surface[ptr++] = (bt & 0x10) ? c : 0;
				this.surface[ptr++] = (bt & 0x20) ? c : 0;
				this.attrs[atptr++] = at;
			}

			vramptr += 16;
		}
	}

	/**
	 * Store PMD 85 VRAM dump to Blob URL or BASE64 data URL.
	 * @returns {string} url to Blob or BASE64 data
	 */
	savePMD85vram(): string {
		const mime = 'application/octet-stream';
		const bin = editor.ctx.createImageData(16, 256).data;

		let blob: Blob = null;
		let url: string = null;

		try {
			blob = new Blob([ bin ], { type: mime });
		}
		catch(ex) {
			console.error(ex);

			try {
				// @ts-ignore
				const bb = new (window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder)();
				bb.append(bin);
				blob = bb.getBlob(mime);
			}
			catch(ex2) {
				console.error(ex2);
				blob = null;
			}
		}

		if (blob) {
			try {
				url = URL.createObjectURL(blob) + '';
			}
			catch(ex) {
				console.error(ex);
				url = null;
			}
		}

		return url;
	}

	/**
	 * Returns nonzero if we need to show grid for exact X coordinate.
	 * @param {number} x coordinate in surface (0-287)
	 */
	isGrid = (x: number) => (editor.showGrid && ((x % 6) === 5)) ? 3 : 0;

	/**
	 * Main render callback of Scroller.
	 * @param {number} left Absolute X Scroller position
	 * @param {number} top Absolute Y Scroller position
	 * @param {number} zoom Scroller internal zoom factor
	 */
	render(left: number, top: number, zoom: number) {
		let x = 0, y = 0, z = 0, s: number;
		const l = Math.max(Math.floor(left / zoom), 0);
		const t = Math.max(Math.floor(top / zoom), 0);

		this.scrollerX = l * zoom;
		this.scrollerY = t * zoom;

		if (zoom !== this.currentZoom) {
			editor.zoomFactor = this.currentZoom = zoom;
			this.bmpW = editor.canvas.width = Math.min(288 * zoom, editor.contentWidth);
			this.bmpH = editor.canvas.height = Math.min(256 * zoom, editor.contentHeight);

			this.bmp = editor.ctx.createImageData(this.bmpW, this.bmpH);
			const bmpBuffer = new ArrayBuffer(this.bmp.data.length);
			this.bmpClamp = new Uint8ClampedArray(bmpBuffer);
			this.bmpDWORD = new Uint32Array(bmpBuffer);
		}

		for (let i = t, w = this.bmpW - zoom; i < 256; i++) {
			x = 0;

			for (let j = l, k = ((i * 288) + j); j < 288; j++, k++) {
				this.scalers[zoom](z + x, this.pal[this.surface[k]], this.isGrid(j));

				if ((s = editor.selection.testBoundsX(j, i)))
					this.marqueeX(z + x + (--s * (zoom - 1)), zoom, y);
				if ((s = editor.selection.testBoundsY(j, i)))
					this.marqueeY(z + x + (--s * (zoom - 1) * this.bmpW), zoom, x);

				x += zoom;
				if (x > w)
					break;
			}

			y += zoom;
			z += zoom * this.bmpW;
			if (y >= this.bmpH)
				break;
		}

		this.bmp.data.set(this.bmpClamp);
		editor.ctx.putImageData(this.bmp, 0, 0);
	}

	/**
	 * Redraws a selected rectangle region of the surface.
	 * @param {number} x coordinate in surface (0-287)
	 * @param {number} y coordinate in surface (0-255)
	 * @param {number} w width of redraw window
	 * @param {number} h height of redraw window
	 * @param {boolean} refreshAttributes (optional) Refresh color from attributes.
	 */
	redrawRect(x: number, y: number, w: number, h: number, refreshAttributes?: boolean) {
		const zoom = this.currentZoom;

		let c: number, d: number, bound: number;
		let sx: number, sy: number;
		let bx: number, by: number;
		let sw = this.bmpW - zoom;
		let sz = (sy = (y * zoom) - this.scrollerY) * this.bmpW;

		for (let i = y; i < (y + h); i++) {
			sx = (x * zoom) - this.scrollerX;

			for (let j = x, k = ((i * 288) + j); j < (x + w); j++, k++) {
				c = this.surface[k];
				if (refreshAttributes && c) {
					d = (Math.floor((i * 48) + Math.floor(j / 6)));
					c = d + ((i & 1) ? -48 : 48);

					d = this.attrs[d];
					c = this.attrs[c];
					c = (d | c | ((d * c) ? 0 : 4));

					this.surface[k] = c;
				}

				if (sx >= 0 && sy >= 0) {
					this.scalers[zoom](sz + sx, this.pal[c], this.isGrid(j));

					if ((bound = editor.selection.testBoundsX(j, i)))
						this.marqueeX(sz + sx + (--bound * (zoom - 1)), zoom, sy);
					if ((bound = editor.selection.testBoundsY(j, i)))
						this.marqueeY(sz + sx + (--bound * (zoom - 1) * this.bmpW), zoom, sx);

					if (bx === undefined) {
						bx = sx;
						by = sy;
					}
				}

				sx += zoom;
				if (sx > sw)
					break;
			}

			sy += zoom;
			sz += zoom * this.bmpW;
			if (sy >= this.bmpH)
				break;
		}

		this.bmp.data.set(this.bmpClamp);
		if (bx !== undefined) {
			sx -= bx;
			sy -= by;
			editor.ctx.putImageData(this.bmp, 0, 0, bx, by, sx, sy);
		}
	}

	redrawSelection(callback: (arg0: any) => void) {
		var x1 = editor.selection.x1, y1 = editor.selection.y1,
			x2 = editor.selection.x2, y2 = editor.selection.y2;

		callback(editor.selection);
		this.redrawRect(x1, y1, x2, y2, false);
	}

	/**
	 * Putting pixel onto surface in specified color and mode.
	 * @param {number} x coordinate in surface (0-287)
	 * @param {number} y coordinate in surface (0-255)
	 * @param {number} mode 0 = reset, 1 = set, 2 = toggle, 3 = only color
	 * @param {number} color 0 = no color change, 1 - 7 change to palette color
	 */
	putPixel(x: number, y: number, mode: number, color: number) {
		if (x < 0 || x >= 288 || y < 0 || y >= 256 ||
			mode < 0 || mode >= 4 || color < 0 || color >= 8) {

			return false;
		}

		const column = Math.floor(x / 6);
		let a1 = Math.floor((y * 48) + column);
		let a2 = a1 + ((y & 1) ? -48 : 48);

		if (a1 > a2) {
			const flip = a2;
			a2 = a1;
			a1 = flip;
		}

		let c = 0;
		if (color) {
			c = color;
			this.attrs[a1] = this.pal[c][7];
			this.attrs[a2] = this.pal[c][8];
		}
		else {
			let d = this.attrs[a1];
			c = this.attrs[a2];
			c = (d | c | ((d * c) ? 0 : 4));
		}

		const ptr = ((y * 288) + x);
		switch (mode) {
			case 0:
				c = this.surface[ptr] = 0;
				break;
			case 1:
				this.surface[ptr] = c;
				break;
			case 2:
				c = this.surface[ptr] = (this.surface[ptr] ? 0 : c);
				break;
		}

		if (color)
			this.redrawRect((column * 6), ((a1 - column) / 48), 6, 2, true);
		else {
			const zoom = this.currentZoom;

			y = (y * zoom) - this.scrollerY;
			x = (x * zoom) - this.scrollerX;

			this.scalers[zoom]((y * this.bmpW) + x, this.pal[c], this.isGrid(x));

			this.bmp.data.set(this.bmpClamp);
			editor.ctx.putImageData(this.bmp, 0, 0, x, y, zoom, zoom);
		}
	}

	/**
	 * Do snapshot of current screen to undo buffer.
	 * @todo not yet fully implemented
	 */
	doSnapshot() {
		const len = this.snapshots.push([
			this.surface.subarray(0, this.surface.length),
			this.attrs.subarray(0, this.attrs.length)
		]);

		if (len > editor.undoLevels)
			this.snapshots.shift();
	}

	/**
	 * Do undo operation.
	 * @returns {boolean} operation result
	 */
	undo(): boolean {
		const u = this.snapshots.pop();
		if (u) {
			return false;
		}

		this.surface.set(u[0], 0);
		this.attrs.set(u[1], 0);

		return true;
	}

	/**
	 * Draw marquee for X coordinate.
	 * @param  {number} p pointer to bitmap
	 * @param  {number} z zoom factor
	 * @param  {number} y coordinate
	 */
	marqueeX(p: number, z: number, y: number) {
		for (let i = 0; i < z; i++, y++) {
			this.bmpDWORD[p] = (y & 4) ? FULL_ALPHA : (this.bmpDWORD[p] | MARQUEE_COLOR);
			p += this.bmpW;
		}
	}

	/**
	 * Draw marquee for Y coordinate.
	 * @param  {number} p pointer to bitmap
	 * @param  {number} z zoom factor
	 * @param  {number} x coordinate
	 */
	marqueeY(p: number, z: number, x: number) {
		for (let i = 0; i < z; i++, x++, p++) {
			this.bmpDWORD[p] = (x & 4) ? FULL_ALPHA : (this.bmpDWORD[p] | MARQUEE_COLOR);
		}
	}

	/**
	 * Scaler functions for each zoom factor separately.
	 * @type {Array} scaler functions
	 */
	scalers: Function[] = [
		null,
	// 1x1
		(p: string | number, c: any[]) => {
			this.bmpDWORD[p] = c[0];
		},
	// 2x2
		(p: number, c: any[]) => {
			var a = c[0], o = this.bmpW - 1;

			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p] = a;
			p += o;
			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p] = a;
		},
	// 3x3
		(p: number, c: any[], g: string | number) => {
			var a = c[0], o = this.bmpW - 2;

			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p] = a;
			p += o;
			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p] = a;
			p += o;
			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p] = c[g];
		},
	// 4x4
		(p: number, c: any[], g: number) => {
			var a = c[0], b = c[g | 1], o = this.bmpW - 3;

			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p] = a;
			p += o;
			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p] = a;
			p += o;
			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p] = a;
			p += o;
			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p] = b;
		},
	// 5x5 disabled
		null,
	// 6x6
		(p: number, c: any[], g: number) => {
			var a = c[0], b = c[1], d = c[g | 1], i: number, o = this.bmpW - 5;

			for (i = 0; i < 5; i++) {
				this.bmpDWORD[p++] = a;
				this.bmpDWORD[p++] = a;
				this.bmpDWORD[p++] = a;
				this.bmpDWORD[p++] = a;
				this.bmpDWORD[p++] = a;
				this.bmpDWORD[p] = (i & 1) ? d : ((i % 2) ? b : a);
				p += o;
			}

			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p++] = b;
			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p++] = b;
			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p] = d;
		},
	// 7x7 disabled
		null,
	// 8x8
		(p: number, c: any[], g: number) => {
			var a = c[0], b = c[1], d = c[2], e = c[g | 1], i: number, j: number, o = this.bmpW - 7;

			for (i = 0; i < 7; i++) {
				for (j = 0; j < 7; j++)
					this.bmpDWORD[p++] = a;
				this.bmpDWORD[p] = (i & 1) ? e : b;
				p += o;
			}

			for (j = 0; j < 7; j++)
				this.bmpDWORD[p++] = d;
			this.bmpDWORD[p] = c[g | 2];
		},
	// 9x9 disabled
		null,
	// 10x10
		(p: number, c: any[], g: number) => {
			var a = c[0], b = c[1], d = c[2], e = c[g | 1], i: number, j: number, o = this.bmpW - 9;

			for (i = 0; i < 9; i++) {
				for (j = 0; j < 9; j++)
					this.bmpDWORD[p++] = a;
				this.bmpDWORD[p] = (i & 1) ? e : b;
				p += o;
			}

			for (j = 0; j < 9; j++)
				this.bmpDWORD[p++] = d;
			this.bmpDWORD[p] = c[g | 2];
		},
	// 11x11 disabled
		null,
	// 12x12
		(p: number, c: any[], g: number) => {
			var a = c[0], b = c[1], d = c[g | 1], i: number, j: number, o = this.bmpW - 11;

			for (i = 0; i < 11; i++) {
				for (j = 0; j < 11; j++)
					this.bmpDWORD[p++] = a;
				this.bmpDWORD[p] = (i & 1) ? d : b;
				p += o;
			}

			for (j = 0; j < 11; j++)
				this.bmpDWORD[p++] = 11;
			this.bmpDWORD[p] = c[g | 2];
		},
	// 13x13 disabled
		null,
	// 14x14
		(p: number, c: any[], g: number) => {
			var a = c[0], b = c[1], d = c[g | 1], i: number, j: number, o = this.bmpW - 13;

			for (i = 0; i < 13; i++) {
				for (j = 0; j < 13; j++)
					this.bmpDWORD[p++] = a;
				this.bmpDWORD[p] = (i & 1) ? d : b;
				p += o;
			}

			for (j = 0; j < 13; j++)
				this.bmpDWORD[p++] = 13;
			this.bmpDWORD[p] = c[g | 2];
		},
	// 15x15 disabled
		null,
	// 16x16
		(p: number, c: any[], g: number) => {
			var a = c[0], b = c[1], d = c[g | 1], i: number, j: number, o = this.bmpW - 15;

			for (i = 0; i < 15; i++) {
				for (j = 0; j < 15; j++)
					this.bmpDWORD[p++] = a;
				this.bmpDWORD[p] = (i & 1) ? d : b;
				p += o;
			}

			for (j = 0; j < 15; j++)
				this.bmpDWORD[p++] = 15;
			this.bmpDWORD[p] = c[g | 2];
		}
	];
}
