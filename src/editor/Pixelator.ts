/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Pixelator - canvas level methods
 *
 * Copyright (c) 2012-2014 Martin Borik
 */

import { editor, EditorDrawMode } from "./Editor";


const FULL_ALPHA = 0xFFFFFFFF;
const MARQUEE_COLOR = 0x302010;
const DEFAULT_BRUSH = `
	...............
	...............
	...............
	...............
	...............
	......OOO......
	.....OOOOO.....
	.....OOOOO.....
	.....OOOOO.....
	......OOO......
	...............
	...............
	...............
	...............
	...............
`;


export interface EditorSnapshot {
	surface: Uint8ClampedArray;
	attrs: Uint8ClampedArray;
	type?: string;
}

export class EditorSnippet {
	data: Uint8ClampedArray;

	constructor(public width: number, public height: number) {
		this.data = new Uint8ClampedArray(width * height);
	}
}

export class Pixelator {
	private currentZoom: number = 0;
	private scrollerX: number = 0;
	private scrollerY: number = 0;
	private bmp: ImageData = null;
	private bmpW: number = null;
	private bmpH: number = null;
	private bmpClamp: Uint8ClampedArray = null;
	private bmpDWORD: Uint32Array = null;
	private bmpBgColor: string;

	snapshots: EditorSnapshot[] = [];
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

	surface: Uint8ClampedArray = new Uint8ClampedArray(288 * 256);
	attrs: Uint8ClampedArray  = new Uint8ClampedArray((288 * 256) / 6);
	brush: Uint8ClampedArray = new Uint8ClampedArray(15 * 15);

	/**
	 * Initialization of palette color table and brush.
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

		this.brush.set(
			DEFAULT_BRUSH
			.replace(/\s/g, '')
			.split('')
			.map(v => v !== '.' ? 255 : 0)
		);

		this.bmpBgColor = getComputedStyle(document.body)
			.getPropertyValue('background-color');
	}

	/**
	 * Clear whole viewport to black.
	 */
	clearViewport() {
		this.surface.fill(0);
		this.attrs.fill(0);
	}

	/**
	 * Binary decoding of PMD 85 screen.
	 *
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
	 * Returns nonzero if we need to show grid for exact X coordinate.
	 *
	 * @param {number} x coordinate in surface (0-287)
	 */
	isGrid = (x: number) => (editor.showGrid && ((x % 6) === 5)) ? 3 : 0;

	/**
	 * Main render callback of Scroller.
	 *
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

		const w = this.bmpW - zoom;
		for (let i = t; i < 256; i++) {
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

		// clear overlapped areas if needed...
		if (x < w) {
			editor.ctx.fillStyle = this.bmpBgColor;
			editor.ctx.fillRect(x, 0, this.bmpW - x, this.bmpH);
		}
		if (y < (this.bmpH - zoom)) {
			editor.ctx.fillStyle = this.bmpBgColor;
			editor.ctx.fillRect(0, y, x, this.bmpH - y);
		}
	}

	/**
	 * Helper method to redraw "outer rectangle" (grown to whole attributes).
	 *
	 * @param {number} x1 top-left X coordinate in surface (0-287)
	 * @param {number} y1 top-left Y coordinate in surface (0-255)
	 * @param {number} x2 bottom-right X coordinate in surface (0-287)
	 * @param {number} y2 bottom-right Y coordinate in surface (0-255)
	 * @param {boolean} attrs (optional) Refresh color from attributes.
	 */
	redrawOuterRect(x1: number, y1: number, x2: number, y2: number, refreshAttributes?: boolean) {
		x1 = Math.max(0, Math.floor(--x1 / 6) * 6);
		x2 = Math.min(288, Math.ceil(++x2 / 6) * 6);
		y1 = Math.max(0, (y1 & ~1) - 2);
		y2 = Math.min(256, (y2 & ~1) + 2);

		this.redrawRect(x1, y1, (x2 - x1), (y2 - y1), refreshAttributes);
	}

	/**
	 * Redraws a selected rectangle region of the surface.
	 *
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

	/**
	 * Putting pixel onto surface in specified color and mode.
	 *
	 * @param {number} x coordinate in surface (0-287)
	 * @param {number} y coordinate in surface (0-255)
	 * @param {EditorDrawMode} mode of drawing
	 * @param {number} color 0 = no color change, 1 - 7 change to palette color
	 * @param {boolean} shouldRedraw (optional) default true
	 */
	putPixel(x: number, y: number,
		mode: EditorDrawMode = editor.editMode, color: number = editor.editColor,
		shouldRedraw: boolean = true) {

		if (x < 0 || x >= 288 || y < 0 || y >= 256 || color < 0 || color >= 8) {
			return;
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
			case EditorDrawMode.Reset:
				c = this.surface[ptr] = 0;
				break;

			case EditorDrawMode.Set:
				this.surface[ptr] = c;
				break;

			case EditorDrawMode.Over:
				c = this.surface[ptr] = (this.surface[ptr] ? 0 : c);
				break;
		}

		if (!shouldRedraw) {
			return;
		}

		if (color) {
			this.redrawRect((column * 6), ((a1 - column) / 48), 6, 2, true);
		}
		else if (mode !== EditorDrawMode.Color) {
			const zoom = this.currentZoom;

			y = (y * zoom) - this.scrollerY;
			x = (x * zoom) - this.scrollerX;

			this.scalers[zoom]((y * this.bmpW) + x, this.pal[c], this.isGrid(x));

			this.bmp.data.set(this.bmpClamp);
			editor.ctx.putImageData(this.bmp, 0, 0, x, y, zoom, zoom);
		}
	}

	/**
	 * Getting pixel color and mode from surface.
	 *
	 * @param {number} x coordinate in surface (0-287)
	 * @param {number} y coordinate in surface (0-255)
	 * @returns {number} color value (1-7) of set pixel or 0 if pixel not set
	 */
	getPixel(x: number, y: number): number {
		if (x < 0 || x >= 288 || y < 0 || y >= 256) {
			return -1;
		}

		let a1 = Math.floor((y * 48) + Math.floor(x / 6));
		let a2 = a1 + ((y & 1) ? -48 : 48);

		if (a1 > a2) {
			const flip = a2;
			a2 = a1;
			a1 = flip;
		}

		const c = this.attrs[a2];
		const d = this.attrs[a1];
		const color = (d | c | ((d * c) ? 0 : 4));

		const ptr = ((y * 288) + x);
		return this.surface[ptr] ? color : 0;
	}

	/**
	 * Do snapshot of current screen to undo buffer.
	 *
	 * @param {boolean} justGet (optional) just return snapshot, not put into undo-buffer
	 * @returns {EditorSnapshot} current screen snapshot
	 */
	doSnapshot(justGet: boolean = false): EditorSnapshot {
		const result: EditorSnapshot = {
			surface: this.surface.slice(),
			attrs: this.attrs.slice()
		};

		if (!justGet) {
			const len = this.snapshots.push(result);
			if (len > editor.undoLevels) {
				this.snapshots.shift();
			}
		}

		return result;
	}

	/**
	 * Do undo operation.
	 *
	 * @param {EditorSnapshot} (optional) snapshot to restore
	 * @returns {boolean} operation result
	 */
	undo(snapshot: EditorSnapshot = this.snapshots.pop()): boolean {
		if (!snapshot) {
			return false;
		}

		this.surface = snapshot.surface.slice();
		this.attrs = snapshot.attrs.slice();

		return true;
	}

	/**
	 * Return true if last snapshot was in given type.
	 *
	 * @param {string} type
	 * @returns {boolean} operation result
	 */
	lastSnapshotOfType(type: string): boolean {
		const len = this.snapshots.length;

		if (len > 0 && this.snapshots[len - 1]['type'] === type) {
			return true;
		}

		return false;
	}

	/**
	 * Draw marquee for X coordinate.
	 *
	 * @param  {number} p pointer to bitmap
	 * @param  {number} z zoom factor
	 * @param  {number} y coordinate
	 */
	marqueeX(p: number, z: number, y: number) {
		for (let i = 0; i < z; i++, y++) {
			this.bmpDWORD[p] = (y & 4) ? FULL_ALPHA : (this.bmpDWORD[p] ^ MARQUEE_COLOR);
			p += this.bmpW;
		}
	}

	/**
	 * Draw marquee for Y coordinate.
	 *
	 * @param  {number} p pointer to bitmap
	 * @param  {number} z zoom factor
	 * @param  {number} x coordinate
	 */
	marqueeY(p: number, z: number, x: number) {
		for (let i = 0; i < z; i++, x++, p++) {
			this.bmpDWORD[p] = (x & 4) ? FULL_ALPHA : (this.bmpDWORD[p] ^ MARQUEE_COLOR);
		}
	}

	/**
	 * Scaler functions for each zoom factor separately.
	 */
	scalers: ((ptr: number, palEntry: any[], grid: number) => void)[] = [
		null,
	// 1x1
		(p: number, c: any[]) => {
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
		(p: number, c: any[], g: number) => {
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
