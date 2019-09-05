/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.ActionShifts - selection shift functions
 *
 * Copyright (c) 2019 Martin Bórik
 */

import { editor, EditorShiftDir } from "./Editor";
import { Selection } from "./Selection";


export class ActionShifts {
	/**
	 * Shift direction and settings are transformed to specific shift method.
	 *
	 * @param {EditorShiftDir} dir - shift direction
	 */
	 shiftSelection(dir: EditorShiftDir) {
		const s = editor.selection;

		if (s.nonEmpty()) {
			const type = `SHIFT_${dir}_${
				editor.editSelectFnShiftAttr ? 'ATTR' : 'PIXS'
			}_${editor.editSelectFnShiftWrap ? 'WRAP' : 'ROLL'}`;

			if (!editor.pixel.lastSnapshotOfType(type)) {
				const snap = editor.pixel.doSnapshot();
				snap.type = type;
			}

			if (editor.editSelectFnShiftAttr) {
				; // TODO
			} else {
				if (dir === EditorShiftDir.UP) {
					this._shiftPixelsUp(s);
				} else if (dir === EditorShiftDir.DN) {
					this._shiftPixelsDown(s);
				} else if (dir === EditorShiftDir.LT) {
					this._shiftPixelsLeft(s);
				} else if (dir === EditorShiftDir.RT) {
					this._shiftPixelsRight(s);
				}
			}

			editor.pixel.redrawOuterRect(s.x1, s.y1, s.x2, s.y2, true);
		}
	}

	private _shiftPixelsUp(s: Selection) {
		const tail = new Uint8ClampedArray(s.w);
		let ptr: number, i: number;
		let x: number, y: number;

		ptr = s.y1 * 288;
		if (editor.editSelectFnShiftWrap) {
			for (i = 0, x = s.x1; x <= s.x2; i++, x++) {
				tail[i] = editor.pixel.surface[ptr + x];
			}
		}

		for (y = s.y1; y < s.y2; y++, ptr += 288) {
			for (x = s.x1; x <= s.x2; x++) {
				editor.pixel.surface[ptr + x] = editor.pixel.surface[ptr + 288 + x];
			}
		}

		for (i = 0, x = s.x1; x <= s.x2; i++, x++) {
			editor.pixel.surface[ptr + x] = tail[i];
		}
	}

	private _shiftPixelsDown(s: Selection) {
		const tail = new Uint8ClampedArray(s.w);
		let ptr: number, i: number;
		let x: number, y: number;

		ptr = s.y2 * 288;
		if (editor.editSelectFnShiftWrap) {
			for (i = 0, x = s.x1; x <= s.x2; i++, x++) {
				tail[i] = editor.pixel.surface[ptr + x];
			}
		}

		for (y = s.y2; y > s.y1; y--, ptr -= 288) {
			for (x = s.x1; x <= s.x2; x++) {
				editor.pixel.surface[ptr + x] = editor.pixel.surface[ptr - 288 + x];
			}
		}

		for (i = 0, x = s.x1; x <= s.x2; i++, x++) {
			editor.pixel.surface[ptr + x] = tail[i];
		}
	}

	private _shiftPixelsLeft(s: Selection) {
		let tail: number, ptr: number;
		let x: number, y: number;

		for (ptr = s.y1 * 288, y = s.y1; y <= s.y2; y++, ptr += 288) {
			tail = 0;
			if (editor.editSelectFnShiftWrap) {
				tail = editor.pixel.surface[ptr + s.x1];
			}

			for (x = s.x1; x < s.x2; x++) {
				editor.pixel.surface[ptr + x] = editor.pixel.surface[ptr + x + 1];
			}

			editor.pixel.surface[ptr + x] = tail;
		}
	}

	private _shiftPixelsRight(s: Selection) {
		let tail: number, ptr: number;
		let x: number, y: number;

		for (ptr = s.y1 * 288, y = s.y1; y <= s.y2; y++, ptr += 288) {
			tail = 0;
			if (editor.editSelectFnShiftWrap) {
				tail = editor.pixel.surface[ptr + s.x2];
			}

			for (x = s.x2; x > s.x1; x--) {
				editor.pixel.surface[ptr + x] = editor.pixel.surface[ptr + x - 1];
			}

			editor.pixel.surface[ptr + x] = tail;
		}
	}
}
