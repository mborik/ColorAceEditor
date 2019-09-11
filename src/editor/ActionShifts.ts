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

			this._shifters[type.substr(0, 16)](s);
			editor.pixel.redrawRect(s.x1, s.y1, s.x2, s.y2, true);
		}
	}

	private _shifters: { [key: string]: (s: Selection) => void } = {
		'SHIFT_DIR_UP_PIX': (s: Selection) => {
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
		},

		'SHIFT_DIR_DN_PIX': (s: Selection) => {
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
		},

		'SHIFT_DIR_LT_PIX': (s: Selection) => {
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
		},

		'SHIFT_DIR_RT_PIX': (s: Selection) => {
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
		},

		'SHIFT_DIR_UP_ATT': (s: Selection) => {
			const pixTail = new Uint8ClampedArray(s.w * 2);
			const atrTail = new Uint8ClampedArray(s.w / 3);
			let pixPtr: number, atrPtr: number;
			let x: number, y: number, i: number, j: number, k: number;

			pixPtr = s.y1 * 288;
			atrPtr = s.y1 * 48;

			if (editor.editSelectFnShiftWrap) {
				for (i = 0, j = 0, x = s.x1, k = x / 6; x <= s.x2; x++) {
					pixTail[i++] = editor.pixel.surface[pixPtr + x];
					pixTail[i++] = editor.pixel.surface[pixPtr + 288 + x];

					if (!(x % 6)) {
						atrTail[j++] = editor.pixel.attrs[atrPtr + k];
						atrTail[j++] = editor.pixel.attrs[atrPtr + 48 + k];

						k++;
					}
				}
			}

			for (y = s.y1; y <= (s.y2 - 2); y++, pixPtr += 288, atrPtr += 48) {
				for (x = s.x1, k = x / 6; x <= s.x2; x++) {
					editor.pixel.surface[pixPtr + x] = editor.pixel.surface[pixPtr + 576 + x];

					if (!(x % 6)) {
						editor.pixel.attrs[atrPtr + k] = editor.pixel.attrs[atrPtr + 96 + k];
						k++;
					}
				}
			}

			for (i = 0, j = 0, x = s.x1, k = x / 6; x <= s.x2; x++) {
				editor.pixel.surface[pixPtr + x] = pixTail[i++];
				editor.pixel.surface[pixPtr + 288 + x] = pixTail[i++];

				if (!(x % 6)) {
					editor.pixel.attrs[atrPtr + k] = atrTail[j++];
					editor.pixel.attrs[atrPtr + 48 + k] = atrTail[j++];

					k++;
				}
			}
		},

		'SHIFT_DIR_DN_ATT': (s: Selection) => {
			const pixTail = new Uint8ClampedArray(s.w * 2);
			const atrTail = new Uint8ClampedArray(s.w / 3);
			let pixPtr: number, atrPtr: number;
			let x: number, y: number, i: number, j: number, k: number;

			pixPtr = s.y2 * 288;
			atrPtr = s.y2 * 48;

			if (editor.editSelectFnShiftWrap) {
				for (i = 0, j = 0, x = s.x1, k = x / 6; x <= s.x2; x++) {
					pixTail[i++] = editor.pixel.surface[pixPtr - 288 + x];
					pixTail[i++] = editor.pixel.surface[pixPtr + x];

					if (!(x % 6)) {
						atrTail[j++] = editor.pixel.attrs[atrPtr - 48 + k];
						atrTail[j++] = editor.pixel.attrs[atrPtr + k];

						k++;
					}
				}
			}

			for (y = s.y2; y >= (s.y1 + 2); y--, pixPtr -= 288, atrPtr -= 48) {
				for (x = s.x1, k = x / 6; x <= s.x2; x++) {
					editor.pixel.surface[pixPtr + x] = editor.pixel.surface[pixPtr - 576 + x];

					if (!(x % 6)) {
						editor.pixel.attrs[atrPtr + k] = editor.pixel.attrs[atrPtr - 96 + k];
						k++;
					}
				}
			}

			for (i = 0, j = 0, x = s.x1, k = x / 6; x <= s.x2; x++) {
				editor.pixel.surface[pixPtr - 288 + x] = pixTail[i++];
				editor.pixel.surface[pixPtr + x] = pixTail[i++];

				if (!(x % 6)) {
					editor.pixel.attrs[atrPtr - 48 + k] = atrTail[j++];
					editor.pixel.attrs[atrPtr + k] = atrTail[j++];

					k++;
				}
			}
		},

		'SHIFT_DIR_LT_ATT': (s: Selection) => {
			const pixTail = new Uint8ClampedArray(6);
			let atrTail: number;
			let pixPtr: number, atrPtr: number;
			let x: number, y: number, i: number, k: number;

			pixPtr = s.y1 * 288;
			atrPtr = s.y1 * 48;

			for (y = s.y1; y <= s.y2; y++, pixPtr += 288, atrPtr += 48) {
				x = s.x1;
				k = x / 6;

				atrTail = 0;
				pixTail.fill(0);
				if (editor.editSelectFnShiftWrap) {
					atrTail = editor.pixel.attrs[atrPtr + k];

					for (i = 0; i < 6; i++) {
						pixTail[i] = editor.pixel.surface[pixPtr + x + i];
					}
				}

				for (; x <= s.x2 - 6; x++) {
					editor.pixel.surface[pixPtr + x] = editor.pixel.surface[pixPtr + x + 6];

					if (!(x % 6)) {
						editor.pixel.attrs[atrPtr + k] = editor.pixel.attrs[atrPtr + k + 1];
						k++;
					}
				}

				editor.pixel.attrs[atrPtr + k] = atrTail;

				for (i = 0; i < 6; i++, x++) {
					editor.pixel.surface[pixPtr + x] = pixTail[i];
				}
			}
		},

		'SHIFT_DIR_RT_ATT': (s: Selection) => {
			const pixTail = new Uint8ClampedArray(6);
			let atrTail: number;
			let pixPtr: number, atrPtr: number;
			let x: number, y: number, i: number, k: number;

			pixPtr = s.y1 * 288;
			atrPtr = s.y1 * 48;

			for (y = s.y1; y <= s.y2; y++, pixPtr += 288, atrPtr += 48) {
				x = s.x2;
				k = Math.floor(x / 6);

				atrTail = 0;
				pixTail.fill(0);
				if (editor.editSelectFnShiftWrap) {
					atrTail = editor.pixel.attrs[atrPtr + k];

					for (i = 0; i < 6; i++) {
						pixTail[i] = editor.pixel.surface[pixPtr + x - i];
					}
				}

				for (; x >= s.x1 + 6; x--) {
					editor.pixel.surface[pixPtr + x] = editor.pixel.surface[pixPtr + x - 6];

					if (!(x % 6)) {
						editor.pixel.attrs[atrPtr + k] = editor.pixel.attrs[atrPtr + k - 1];
						k--;
					}
				}

				editor.pixel.attrs[atrPtr + k] = atrTail;

				for (i = 0; i < 6; i++, x--) {
					editor.pixel.surface[pixPtr + x] = pixTail[i];
				}
			}
		}
	}
}
