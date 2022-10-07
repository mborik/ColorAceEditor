/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor namespace and base class definition acting as singleton
 *
 * Copyright (c) 2012-2022 Martin Bórik
 */

/// <reference path="../global.d.ts" />

import { ActionHandler } from './ActionHandler';
import { Drawing } from './Drawing';
import { FileOps } from './FileOps';
import { Pixelator } from './Pixelator';
import { Selection } from './Selection';
import { Scroller } from 'scroller';


export const enum EditorColorMode {
	Full = 'TBCM_FULL',
	RGB  = 'TBCM_RGB',
	Mono = 'TBCM_MONO',
}

export const enum EditorTool {
	Selection  = 'TBFN_SELECT',
	AttrSelect = 'TBFN_ATTRSEL',
	Pencil     = 'TBFN_PENCIL',
	Brush      = 'TBFN_BRUSH',
	Fill       = 'TBFN_FILL',
	Lines      = 'TBFN_LINES',
	Ellipse    = 'TBFN_ELLIPSE',
	Rectangle  = 'TBFN_RECT',
	// point position recorder
	Recorder   = 'TBFN_RECORDER',
	// filled shape mode
	FillShape  = 'TBSM_FILLSHAPE'
}

export const enum EditorDrawMode {
	Reset = 'TBDM_RESET',
	Set   = 'TBDM_SET',
	Over  = 'TBDM_OVER',
	Color = 'TBDM_COLOR'
}

export const enum EditorDirection {
	// shifts
	UP = 'DIR_UP',
	LT = 'DIR_LT',
	RT = 'DIR_RT',
	DN = 'DIR_DN',
	// flips
	FH = 'FLIP_H',
	FV = 'FLIP_V'
}

type EditorSelectionActionFn = (nonEmpty: boolean) => void;
export interface EditorOptions {
	selectCB: EditorSelectionActionFn;
	canvas: HTMLCanvasElement;
	upload: HTMLCanvasElement;
	status?: HTMLDivElement;
}

export interface EditorCoordinates {
	x: number;
	y: number;
}

interface CanvasCoordinates extends EditorCoordinates {
	column: number;
}

export let editor: Editor;
export class Editor extends FileOps {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	statusBar: Nullable<HTMLDivElement>;

	contentWidth: number = 0;
	contentHeight: number = 0;
	zoomFactor: number = 1;
	showGuides: boolean = true;
	undoLevels: number = 50;
	editColor: number = 0;
	editColorMode: EditorColorMode = EditorColorMode.Full;
	editTool: EditorTool = EditorTool.Pencil;
	editMode: EditorDrawMode = EditorDrawMode.Over;
	editFilled: boolean = false;

	editSelectFnShiftWrap: boolean = true;
	editSelectFnShiftAttr: boolean = false;
	editSelectFnBlockAttr: boolean = false;

	selectionActionCallback: EditorSelectionActionFn;

	coordsRecorder: { x: number, y: number }[] = [];

	action: ActionHandler = new ActionHandler();
	draw: Drawing = new Drawing();
	pixel: Pixelator = new Pixelator();
	selection: Selection = new Selection();

	scroller = new Scroller(
		this.pixel.render.bind(this.pixel),
		{
			animating: false,
			bouncing: false,
			snapping: false,
			locking: false,
			zooming: 1,
			maxZoom: 16,
			minZoom: 1
		}
	);

	constructor(opt: EditorOptions) {
		super(opt.upload);

		if (!(opt.canvas instanceof HTMLCanvasElement)) {
			throw Error('ColorAceEditor: Canvas element not defined!');
		}

		const canvasContext = opt.canvas.getContext('2d');
		if (!(canvasContext instanceof CanvasRenderingContext2D)) {
			throw Error('ColorAceEditor: Canvas rendering context not defined!');
		}

		this.ctx = canvasContext;
		this.canvas = opt.canvas;
		this.statusBar = opt.status || null;
		this.selectionActionCallback = opt.selectCB;
	}

	/**
	 * Brush shape getter/setter to convert between string and ArrayBuffer.
	 */
	get editBrushShape(): string {
		return Array.from(this.pixel.brush)
			.map(v => v ? 'O' : '.')
			.join('');
	}
	set editBrushShape(dataString: string) {
		this.pixel.brush.set(
			dataString
				.replace(/\s/g, '')
				.split('')
				.map(v => v !== '.' ? 255 : 0)
		);
	}

	/**
	 * Set editor and scroller dimensions.
	 *
	 * @param w Workspace width
	 * @param h Workspace height
	 */
	setDimensions(w: number, h: number) {
		this.contentWidth = w;
		this.contentHeight = h;

		// reduce viewport size by these constants to properly uncover marginal
		// pixels on the edge of screen while panning on higher zoom factor...
		this.scroller.setDimensions(w - 64, h - 32, 288, 256);
	}

	/**
	 * Translation of "real world" coordinates on page to our pixel space.
	 *
	 * @param sx Real mouse cursor X position
	 * @param sy Real mouse cursor X position
	 * @return Object with properties 'x', 'y' and 'column'
	 */
	translateCoords(sx: number, sy: number): CanvasCoordinates {
		const rect = this.canvas.getBoundingClientRect();
		const s = this.scroller.getValues();
		const o = {
			left: rect.left + document.body.scrollLeft,
			top: rect.top + document.body.scrollTop
		};

		s.left = Math.max(Math.floor(s.left / s.zoom), 0) * s.zoom;
		s.top = Math.max(Math.floor(s.top / s.zoom), 0) * s.zoom;

		const x = Math.floor(((sx - o.left) + s.left) / s.zoom);
		const y = Math.floor(((sy - o.top) + s.top) / s.zoom);

		return { x, y, column: Math.floor(x / 6) };
	}

	/**
	 * Generate new status bar message string with coordinates.
	 *
	 * @param vx Viewport cursor X position
	 * @param vy Viewport cursor X position
	 * @param column Viewport cursor attribute column by X
	 */
	redrawStatusBar(vx: number, vy: number, column: number = Math.floor(vx / 6)) {
		if (!this.statusBar) {
			return;
		}

		const x = Math.max(0, Math.min(vx, 287));
		const y = Math.max(0, Math.min(vy, 255));
		const c = Math.max(0, Math.min(column, 47));
		const a = `${(49152 + (y * 64) + c).toString(16).toUpperCase()}h`;
		const z = this.zoomFactor * 100;

		const pad = (num: string | number, len: number) => num.toString().padStart(len);

		this.statusBar.textContent =
			`${pad(z, 4)}%   X:${pad(x, 3)} Y:${pad(y, 3)}  C:${pad(c, 2)}   ${a}`
				.replace(/\s/g, '\u00A0');
	}

	/**
	 * Wrapper of `Pixelator.render` through the `Scroller.zoomTo`
	 * with current zoom factor.
	 */
	refresh = () => this.scroller.zoomTo(this.zoomFactor);
}

/**
 * @return singleton instance
 */
export const getInstance = (opt: EditorOptions): Editor =>
	(editor instanceof Editor) ? editor : (editor = new Editor(opt));
