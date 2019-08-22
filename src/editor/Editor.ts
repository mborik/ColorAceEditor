/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor namespace and base class definition acting as singleton
 *
 * Copyright (c) 2012-2019 Martin Bórik
 */

import { ActionHandler } from "./ActionHandler";
import { Drawing } from "./Drawing";
import { FileOps } from "./FileOps";
import { Pixelator } from "./Pixelator";
import { Selection } from "./Selection";
import { Scroller } from "scroller";


export interface EditorOptions {
	canvas: HTMLCanvasElement;
	upload: HTMLCanvasElement;
	zoom?: number;
	undo: number;
	grid: boolean;
}

interface CanvasCoordinates {
	x: number;
	y: number;
	column: number;
}

export var editor: Editor = null;
export class Editor extends FileOps {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;

	statusBar: string = '';
	contentWidth: number = 0;
	contentHeight: number = 0;
	zoomFactor: number = 1;
	showGrid: boolean = true;
	undoLevels: number = 10;
	editColor: number = 0;
	editTool: number = 2;
	editMode: number = 2;
	editSelect: number = 0;
	editFilled: boolean = false;

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
			throw Error("ColorAceEditor: Canvas element not defined!");
		}

		this.canvas = opt.canvas;
		this.ctx = this.canvas.getContext("2d");

		this.zoomFactor = opt.zoom || 1;
		this.showGrid = opt.grid || true;
		this.undoLevels = opt.undo || 10;

		this.pixel.surface = this.ctx.createImageData((288 / 4), 256).data;
		this.pixel.attrs  = this.ctx.createImageData((288 / 24), 256).data;
	}

	/**
	* Set editor and scroller dimensions.
	* @param {number} w - webpage workspace width
	* @param {number} h - webpage workspace height
	*/
	setDimensions(w: number, h: number) {
		this.contentWidth = w;
		this.contentHeight = h;

		this.scroller.setDimensions(w - 276, h, 288, 256);
	}

	/**
	* Translation of "real world" coordinates on page to our pixel space.
	* @param {number} sx - real mouse cursor X position
	* @param {number} sy - real mouse cursor X position
	* @return {CanvasCoordinates} object with properties 'x', 'y' and 'column'
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
	* @param {number} sx - real mouse cursor X position
	* @param {number} sy - real mouse cursor X position
	*/
	redrawStatusBar(sx: number, sy: number) {
		const coords = this.translateCoords(sx, sy);

		const x = Math.max(0, Math.min(coords.x, 287));
		const y = Math.max(0, Math.min(coords.y, 255));
		const c = Math.max(0, Math.min(coords.column, 47));
		const a = `${(49152 + (y * 64) + c).toString(16).toUpperCase()}h`;
		const z = this.zoomFactor * 100;

		const pad = (num: string | number, len: number) => num.toString().padStart(len);

		this.statusBar = `${pad(z, 4)}%   X:${pad(x, 3)} Y:${pad(y, 3)}  C:${pad(c, 2)}   ${a}`;
	}
}

/**
 * @return {Editor} singleton instance
 */
export const getInstance = (opt: EditorOptions): Editor =>
	(editor instanceof Editor) ? editor : (editor = new Editor(opt));
