/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Pixelator - canvas level methods
 *
 * Copyright (c) 2012-2022 Martin Bórik
 */

import { editor, EditorColorMode, EditorDrawMode } from './Editor';


const FULL_ALPHA = 0xFFFFFFFF;
const MARQUEE_COLOR = 0x302010;

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
	private isColorAceMode: boolean = true;
	private currentZoom: number = 0;
	private scrollerX: number = 0;
	private scrollerY: number = 0;
	private bmp: ImageData;
	private bmpW: number;
	private bmpH: number;
	private bmpClamp: Uint8ClampedArray;
	private bmpDWORD: Uint32Array;
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
	attrs: Uint8ClampedArray = new Uint8ClampedArray((288 * 256) / 6);
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
			const y = Math.floor(96 - ((255 + r + g + b) / 16));

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

		this.resetBrushShape();
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
	 * Actions related to changing color mode.
	 *
	 * @param colorMode Target color mode
	 */
	changeColorMode(colorMode: EditorColorMode) {
		this.isColorAceMode = colorMode === EditorColorMode.Full;

		editor.editColorMode = colorMode;
		editor.canvas.className = colorMode === EditorColorMode.Mono ? 'monochrome' : '';
	}

	/**
	 * Refresh viewport attributes according to changing color mode.
	 *
	 * @param colorMode Target color mode
	 */
	refreshAttrs(colorMode?: EditorColorMode) {
		const vram = this.preparePMD85vram();
		if (colorMode) {
			this.changeColorMode(colorMode);
		}
		this.readPMD85vram(vram);
	}

	/**
	 * Binary decoding of PMD 85 screen.
	 *
	 * @param videoRam With dump of PMD 85 VRAM (0xC000-0xFFFF)
	 */
	readPMD85vram(videoRam: Uint8Array | number[]) {
		if (videoRam.length !== 16384) {
			return;
		}

		let vramptr = 0;
		let ptr = 0, atptr = 0;
		let h: number = 256;
		let i: number, attr: number;
		let byte: number, siblingByte: number, siblingAttr = 0;

		while (h--) {
			for (i = 0; i < 48; i++, vramptr++) {
				byte = videoRam[vramptr];
				attr = (byte & 0xC0) >> 6;

				if (this.isColorAceMode) {
					siblingByte = videoRam[vramptr + ((h & 1) ? 64 : -64)];
					siblingAttr = (siblingByte & 0xC0) >> 6;
					attr = attr | siblingAttr | ((attr & siblingAttr) ? 0 : 4);
				}
				else {
					attr = attr || 4;
				}

				this.surface[ptr++] = (byte & 0x01) ? attr : 0;
				this.surface[ptr++] = (byte & 0x02) ? attr : 0;
				this.surface[ptr++] = (byte & 0x04) ? attr : 0;
				this.surface[ptr++] = (byte & 0x08) ? attr : 0;
				this.surface[ptr++] = (byte & 0x10) ? attr : 0;
				this.surface[ptr++] = (byte & 0x20) ? attr : 0;

				this.attrs[atptr++] = this.pal[attr][(h & 1) + 7];
			}

			vramptr += 16;
		}
	}

	/**
	 * Binary encoding of PMD 85 screen memory.
	 */
	preparePMD85vram(): Uint8Array {
		const vram = new Uint8Array(16384);

		for (let ptr = 0, attrPtr = 0, src = 0; ptr < 16384;) {
			for (let x = 0; x < 48; x++, ptr++) {
				vram[ptr] =
					(this.surface[src++] ? 0x01 : 0) |
					(this.surface[src++] ? 0x02 : 0) |
					(this.surface[src++] ? 0x04 : 0) |
					(this.surface[src++] ? 0x08 : 0) |
					(this.surface[src++] ? 0x10 : 0) |
					(this.surface[src++] ? 0x20 : 0) |
					(this.attrs[attrPtr++] << 6);
			}

			ptr += 16;
		}

		return vram;
	}

	/**
	 * Returns nonzero if we need to show guideline for exact X coordinate.
	 *
	 * @param x Coordinate in surface (0-287)
	 */
	isGuide = (x: number) => (editor.showGuides && ((x % 6) === 5)) ? 3 : 0;

	/**
	 * Main render callback of Scroller.
	 *
	 * @param left Absolute X Scroller position
	 * @param top Absolute Y Scroller position
	 * @param zoom Scroller internal zoom factor
	 */
	render(left: number, top: number, zoom: number) {
		const { canvas, ctx, contentWidth, contentHeight, selection } = editor;
		const offsetX = Math.max(Math.floor(left / zoom), 0);
		const offsetY = Math.max(Math.floor(top / zoom), 0);

		this.scrollerX = offsetX * zoom;
		this.scrollerY = offsetY * zoom;

		if (zoom !== this.currentZoom) {
			editor.zoomFactor = this.currentZoom = zoom;
			this.bmpW = canvas.width = Math.min(288 * zoom, contentWidth);
			this.bmpH = canvas.height = Math.min(256 * zoom, contentHeight);

			this.bmp = ctx.createImageData(this.bmpW, this.bmpH);

			const bmpBuffer = new ArrayBuffer(this.bmp.data.length);
			this.bmpClamp = new Uint8ClampedArray(bmpBuffer);
			this.bmpDWORD = new Uint32Array(bmpBuffer);
		}

		let x = 0, y = 0, ptr = 0;
		const width = this.bmpW - zoom;

		for (let iy = offsetY; iy < 256; iy++) {
			x = 0;

			for (let ix = offsetX, k = ((iy * 288) + ix); ix < 288; ix++, k++) {
				this.scalers[zoom]?.(
					ptr + x,
					this.pal[this.surface[k]],
					this.isGuide(ix)
				);

				let bound: number;
				if ((bound = selection.testBoundsX(ix, iy))) {
					this.marqueeX(
						ptr + x + (--bound * (zoom - 1)),
						zoom,
						y
					);
				}
				if ((bound = selection.testBoundsY(ix, iy))) {
					this.marqueeY(
						ptr + x + (--bound * (zoom - 1) * this.bmpW),
						zoom,
						x
					);
				}

				x += zoom;
				if (x > width) {
					break;
				}
			}

			y += zoom;
			ptr += zoom * this.bmpW;
			if (y >= this.bmpH) {
				break;
			}
		}

		ctx.save();
		ctx.fillStyle = this.bmpBgColor;

		// clear overlapped areas if needed...
		if (x < width) {
			ctx.fillRect(x, 0, this.bmpW - x, this.bmpH);
		}
		if (y < (this.bmpH - zoom)) {
			ctx.fillRect(0, y, x, this.bmpH - y);
		}

		ctx.restore();
		this.bmp.data.set(this.bmpClamp);
		ctx.putImageData(this.bmp, 0, 0, 0, 0, x, y);
	}

	/**
	 * Helper method to redraw "outer rectangle" (grown to whole attributes).
	 *
	 * @param x1 Top-left X coordinate in surface (0-287)
	 * @param y1 Top-left Y coordinate in surface (0-255)
	 * @param x2 Bottom-right X coordinate in surface (0-287)
	 * @param y2 Bottom-right Y coordinate in surface (0-255)
	 * @param refreshAttributes Refresh color from attributes.
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
	 * @param x Coordinate in surface (0-287)
	 * @param y Coordinate in surface (0-255)
	 * @param w Width of redraw window
	 * @param h Height of redraw window
	 * @param refreshAttributes Refresh color from attributes.
	 */
	redrawRect(x: number, y: number, w: number, h: number, refreshAttributes?: boolean) {
		const { ctx, selection } = editor;

		const zoom = this.currentZoom;
		const surfaceWidth = this.bmpW - zoom;

		let sx: Optional<number>, sy: Optional<number>;
		let bx: Optional<number>, by: Optional<number>;
		let zoomedSurfacePtr = (sy = (y * zoom) - this.scrollerY) * this.bmpW;

		for (let iy = y; iy < (y + h); iy++) {
			sx = (x * zoom) - this.scrollerX;

			for (let ix = x, k = ((iy * 288) + ix); ix < (x + w); ix++, k++) {
				let attr = this.surface[k];
				if (refreshAttributes && attr) {
					const ulineAddress = (iy * 48) + ~~(ix / 6);
					attr = this.attrs[ulineAddress];

					if (this.isColorAceMode) {
						const siblingUlineAddress = ulineAddress + ((iy & 1) ? -48 : 48);
						const siblingAttr = this.attrs[siblingUlineAddress];

						attr = (attr | siblingAttr | ((attr & siblingAttr) ? 0 : 4));
					}
					else {
						attr = attr || 4;
					}

					this.surface[k] = attr;
				}

				if (sx >= 0 && sy >= 0) {
					this.scalers[zoom]?.(
						zoomedSurfacePtr + sx,
						this.pal[attr],
						this.isGuide(ix)
					);

					let bound: number;
					if ((bound = selection.testBoundsX(ix, iy))) {
						this.marqueeX(
							zoomedSurfacePtr + sx + (--bound * (zoom - 1)),
							zoom,
							sy
						);
					}
					if ((bound = selection.testBoundsY(ix, iy))) {
						this.marqueeY(
							zoomedSurfacePtr + sx + (--bound * (zoom - 1) * this.bmpW),
							zoom,
							sx
						);
					}

					if (bx === undefined) {
						bx = sx;
						by = sy;
					}
				}

				sx += zoom;
				if (sx > surfaceWidth) {
					break;
				}
			}

			sy += zoom;
			zoomedSurfacePtr += zoom * this.bmpW;
			if (sy >= this.bmpH) {
				break;
			}
		}

		this.bmp.data.set(this.bmpClamp);
		if (sx !== undefined && sy !== undefined && bx !== undefined && by !== undefined) {
			sx -= bx;
			sy -= by;
			ctx.putImageData(this.bmp, 0, 0, bx, by, sx, sy);
		}
	}

	/**
	 * Putting pixel onto surface in specified color and mode.
	 *
	 * @param x Coordinate in surface (0-287)
	 * @param y Coordinate in surface (0-255)
	 * @param mode Mode of drawing
	 * @param color 0 = no color change, 1 - 7 change to palette color
	 * @param shouldRedraw default true
	 */
	putPixel(x: number, y: number,
		mode: EditorDrawMode = editor.editMode, color: number = editor.editColor,
		shouldRedraw: boolean = true) {

		if (x < 0 || x >= 288 || y < 0 || y >= 256 || color < 0 || color >= 8) {
			return;
		}

		const column = Math.floor(x / 6);
		let baseAddress = Math.floor((y * 48) + column);
		let attr = 0;

		if (this.isColorAceMode) {
			let siblingAddress = baseAddress + ((y & 1) ? -48 : 48);
			if (baseAddress > siblingAddress) {
				const flip = siblingAddress;
				siblingAddress = baseAddress;
				baseAddress = flip;
			}

			if (color) {
				attr = color;
				this.attrs[baseAddress] = this.pal[attr][7];
				this.attrs[siblingAddress] = this.pal[attr][8];
			}
			else {
				const baseAttr = this.attrs[baseAddress];
				const siblingAttr = this.attrs[siblingAddress];
				attr = (baseAttr | siblingAttr | ((baseAttr & siblingAttr) ? 0 : 4));
			}
		}
		else {
			if (color) {
				this.attrs[baseAddress] = this.pal[color][7];
			}

			attr = this.attrs[baseAddress] || 4;
		}

		const ptr = ((y * 288) + x);
		switch (mode) {
			case EditorDrawMode.Reset:
				attr = this.surface[ptr] = 0;
				break;

			case EditorDrawMode.Set:
				this.surface[ptr] = attr;
				break;

			case EditorDrawMode.Over:
				attr = this.surface[ptr] = (this.surface[ptr] ? 0 : attr);
				break;
		}

		if (!shouldRedraw) {
			return;
		}

		if (color) {
			this.redrawRect((column * 6), ((baseAddress - column) / 48), 6, 2, true);
		}
		else if (mode !== EditorDrawMode.Color) {
			const zoom = this.currentZoom;

			y = (y * zoom) - this.scrollerY;
			x = (x * zoom) - this.scrollerX;

			this.scalers[zoom]?.((y * this.bmpW) + x, this.pal[attr], this.isGuide(x));

			this.bmp.data.set(this.bmpClamp);
			editor.ctx.putImageData(this.bmp, 0, 0, x, y, zoom, zoom);
		}
	}

	/**
	 * Getting pixel color and mode from surface.
	 *
	 * @param x Coordinate in surface (0-287)
	 * @param y Coordinate in surface (0-255)
	 * @returns color value (1-7) of set pixel or 0 if pixel not set
	 */
	getPixel(x: number, y: number): number {
		if (x < 0 || x >= 288 || y < 0 || y >= 256) {
			return -1;
		}

		const baseAddress = Math.floor((y * 48) + Math.floor(x / 6));
		let attr = this.attrs[baseAddress];

		if (this.isColorAceMode) {
			const siblingAddress = baseAddress + ((y & 1) ? -48 : 48);
			const siblingAttr = this.attrs[siblingAddress];
			attr = (attr | siblingAttr | ((attr & siblingAttr) ? 0 : 4));
		}
		else {
			attr = attr || 4;
		}

		const ptr = ((y * 288) + x);
		return this.surface[ptr] ? attr : 0;
	}

	/**
	 * Do snapshot of current screen to undo buffer.
	 *
	 * @param justGet Just return snapshot, not put into undo-buffer
	 * @returns Current screen snapshot
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
	 * @param snapshot Snapshot to restore
	 */
	undo(snapshot: Optional<EditorSnapshot> = this.snapshots.pop()): boolean {
		if (!snapshot) {
			return false;
		}

		this.surface = snapshot.surface.slice();
		this.attrs = snapshot.attrs.slice();

		return true;
	}

	/**
	 * Return true if last snapshot was in given type.
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
	 * @param p Pointer to bitmap
	 * @param z Zoom factor
	 * @param y Coordinate
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
	 * @param p Pointer to bitmap
	 * @param z Zoom factor
	 * @param x Coordinate
	 */
	marqueeY(p: number, z: number, x: number) {
		for (let i = 0; i < z; i++, x++, p++) {
			this.bmpDWORD[p] = (x & 4) ? FULL_ALPHA : (this.bmpDWORD[p] ^ MARQUEE_COLOR);
		}
	}

	/**
	 * Reset brush shape ArrayBuffer to default midpoint filled circle.
	 */
	resetBrushShape() {
		this.brush.fill(0);

		const brushSize = Math.sqrt(this.brush.length);
		const radius = brushSize / 6;
		const boundL = Math.floor((brushSize / 2) - radius);
		const boundR = Math.ceil((brushSize / 2) + radius) - 1;

		for (let y: number = boundL, x: number; y <= boundR; y++) {
			for (x = boundL; x <= boundR; x++) {
				if ((x !== boundL && x !== boundR) || (y !== boundL && y !== boundR)) {
					this.brush[x + (y * brushSize)] = 255;
				}
			}
		}
	}

	/**
	 * Scaler functions for each zoom factor separately.
	 */
	scalers: Nullable<(ptr: number, palEntry: any[], grid: number) => void>[] = [
		null,
	// 1x1
		(p: number, c: any[]) => {
			this.bmpDWORD[p] = c[0];
		},
	// 2x2
		(p: number, c: any[]) => {
			const a = c[0], o = this.bmpW - 1;

			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p] = a;
			p += o;
			this.bmpDWORD[p++] = a;
			this.bmpDWORD[p] = a;
		},
	// 3x3
		(p: number, c: any[], g: number) => {
			const a = c[0], o = this.bmpW - 2;

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
			const a = c[0], b = c[g | 1], o = this.bmpW - 3;

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
			const a = c[0], b = c[1], d = c[g | 1], o = this.bmpW - 5;

			for (let i = 0; i < 5; i++) {
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
			const a = c[0], b = c[1], d = c[2], e = c[g | 1], o = this.bmpW - 7;

			for (let i = 0; i < 7; i++) {
				for (let j = 0; j < 7; j++) {
					this.bmpDWORD[p++] = a;
				}
				this.bmpDWORD[p] = (i & 1) ? e : b;
				p += o;
			}

			for (let j = 0; j < 7; j++) {
				this.bmpDWORD[p++] = d;
			}
			this.bmpDWORD[p] = c[g | 2];
		},
	// 9x9 disabled
		null,
	// 10x10
		(p: number, c: any[], g: number) => {
			const a = c[0], b = c[1], d = c[2], e = c[g | 1], o = this.bmpW - 9;

			for (let i = 0; i < 9; i++) {
				for (let j = 0; j < 9; j++) {
					this.bmpDWORD[p++] = a;
				}
				this.bmpDWORD[p] = (i & 1) ? e : b;
				p += o;
			}

			for (let j = 0; j < 9; j++) {
				this.bmpDWORD[p++] = d;
			}
			this.bmpDWORD[p] = c[g | 2];
		},
	// 11x11 disabled
		null,
	// 12x12
		(p: number, c: any[], g: number) => {
			const a = c[0], b = c[1], d = c[g | 1], o = this.bmpW - 11;

			for (let i = 0; i < 11; i++) {
				for (let j = 0; j < 11; j++) {
					this.bmpDWORD[p++] = a;
				}
				this.bmpDWORD[p] = (i & 1) ? d : b;
				p += o;
			}

			for (let j = 0; j < 11; j++) {
				this.bmpDWORD[p++] = 11;
			}
			this.bmpDWORD[p] = c[g | 2];
		},
	// 13x13 disabled
		null,
	// 14x14
		(p: number, c: any[], g: number) => {
			const a = c[0], b = c[1], d = c[g | 1], o = this.bmpW - 13;

			for (let i = 0; i < 13; i++) {
				for (let j = 0; j < 13; j++) {
					this.bmpDWORD[p++] = a;
				}
				this.bmpDWORD[p] = (i & 1) ? d : b;
				p += o;
			}

			for (let j = 0; j < 13; j++) {
				this.bmpDWORD[p++] = 13;
			}
			this.bmpDWORD[p] = c[g | 2];
		},
	// 15x15 disabled
		null,
	// 16x16
		(p: number, c: any[], g: number) => {
			const a = c[0], b = c[1], d = c[g | 1], o = this.bmpW - 15;

			for (let i = 0; i < 15; i++) {
				for (let j = 0; j < 15; j++) {
					this.bmpDWORD[p++] = a;
				}
				this.bmpDWORD[p] = (i & 1) ? d : b;
				p += o;
			}

			for (let j = 0; j < 15; j++) {
				this.bmpDWORD[p++] = 15;
			}
			this.bmpDWORD[p] = c[g | 2];
		}
	];
}
