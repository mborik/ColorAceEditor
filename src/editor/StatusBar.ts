/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Uploader - processing of uploaded file
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import { STATUS_BAR } from '../elements';
import { pad } from '../utils';
import { Editor } from './Editor';
import { FileOps } from './FileOps';


export class StatusBar extends FileOps {
	constructor(public statusBar: HTMLDivElement = STATUS_BAR()) {
		super();
	}

	/**
	 * Generate new status bar message string with coordinates.
	 *
	 * @param vx Viewport cursor X position
	 * @param vy Viewport cursor X position
	 * @param column Viewport cursor attribute column by X
	 */
	redrawStatusBar(this: Editor, vx: number, vy: number, column?: number) {
		const { zoomFactor, editTool } = this;

		let x: Optional<number>, y: Optional<number>, c: Optional<number>;
		let a: Optional<string>;

		if (vx >= 0 && vx < 288 && vy >= 0 && vy < 256) {
			x = vx;
			y = vy;
			c = column ?? Math.floor(vx / 6);
			a = `${(49152 + (y * 64) + c).toString(16).toUpperCase()}h`;
		}

		this.statusBar.textContent = `ZOOM: ${pad(zoomFactor * 100, 4)}%  TOOL: ${editTool.substring(5)}${
			`\n X:${pad(x, 3)}  Y:${pad(y, 3)}  C:${pad(c, 2)}  [${pad(a, 5)}] `}`
			.replace(/ /g, '\u00A0');
	}
}
