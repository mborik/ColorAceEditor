/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.ActionShiftFlip - selection shift functions
 *
 * Copyright (c) 2019 Martin Bórik
 */

import { editor, EditorDirection } from "./Editor";
import { Selection } from "./Selection";


export class ActionShiftFlip {
	/**
	 * Transform shift or flip direction (and settings) to specific handler method.
	 *
	 * @param {EditorDirection} dir - shift direction
	 */
	shiftFlipSelection(dir: EditorDirection) {
		const s = editor.selection;

		if (s.nonEmpty()) {
			if (dir === EditorDirection.FH) {
				editor.pixel.doSnapshot();
				this._flipHorizontal();

			} else if (dir === EditorDirection.FV) {
				editor.pixel.doSnapshot();
				this._flipVertical();

			} else {
				this._shiftSelection(dir);
			}

			editor.pixel.redrawRect(s.x1, s.y1, s.w, s.h, true);
		}
	}

//- flip functions ----------------------------------------------------------------------
	private _flipHorizontal() {
		const { x1, y1, x2, y2 } = editor.selection;
		let fl: number;

		let pixPtr = y1 * 288;
		for (let y = y1; y <= y2; y++, pixPtr += 288) {
			let lb = x1, rb = x2;

			while (lb < rb) {
				fl = editor.pixel.surface[pixPtr + rb];
				editor.pixel.surface[pixPtr + rb] = editor.pixel.surface[pixPtr + lb];
				editor.pixel.surface[pixPtr + lb] = fl;

				++lb;
				--rb;
			}

			if (editor.editSelectFnShiftAttr) {
				const atrPtr = pixPtr / 6;

				lb = Math.floor(x1 / 6);
				rb = Math.floor((x2 - 5) / 6);

				while (lb < rb) {
					fl = editor.pixel.attrs[atrPtr + rb];
					editor.pixel.attrs[atrPtr + rb] = editor.pixel.attrs[atrPtr + lb];
					editor.pixel.attrs[atrPtr + lb] = fl;

					++lb;
					--rb;
				}
			}
		}
	}

	private _flipVertical() {
		const { x1, y1, y2, w } = editor.selection;

		let fl: Uint8ClampedArray;
		let tPtr = (y1 * 288) + x1;
		let bPtr = (y2 * 288) + x1;

		while (tPtr < bPtr) {
			fl = editor.pixel.surface.slice(bPtr, bPtr + w);
			editor.pixel.surface.copyWithin(bPtr, tPtr, tPtr + w);
			editor.pixel.surface.set(fl, tPtr);

			tPtr += 288;
			bPtr -= 288;
		}

		if (editor.editSelectFnShiftAttr) {
			const cw = Math.floor(w / 6);
			const cx = Math.floor(x1 / 6);

			tPtr = (y1 * 48) + cx;
			bPtr = ((y2 & ~1) * 48) + cx;

			while (tPtr < bPtr) {
				fl = editor.pixel.attrs.slice(bPtr, bPtr + cw);
				editor.pixel.attrs.copyWithin(bPtr, tPtr, tPtr + cw);
				editor.pixel.attrs.set(fl, tPtr);

				tPtr += 48;
				bPtr += 48;

				fl = editor.pixel.attrs.slice(bPtr, bPtr + cw);
				editor.pixel.attrs.copyWithin(bPtr, tPtr, tPtr + cw);
				editor.pixel.attrs.set(fl, tPtr);

				tPtr += 48;
				bPtr -= 144;
			}
		}
	}

//- shift functions ---------------------------------------------------------------------
	private _shiftSelection(dir: EditorDirection) {
		const type = `SHIFT_${dir}_${
			editor.editSelectFnShiftAttr ? 'ATTR' : 'PIXS'
		}_${editor.editSelectFnShiftWrap ? 'WRAP' : 'ROLL'}`;

		if (!editor.pixel.lastSnapshotOfType(type)) {
			const snap = editor.pixel.doSnapshot();
			snap.type = type;
		}

		this._shifters[type.substr(0, 16)](editor.selection);
	}

	private _shifters: { [key: string]: (s: Selection) => void } = {
		'SHIFT_DIR_UP_PIX': (s: Selection) => {
			let tail = new Uint8ClampedArray(s.w);
			let ptr = (s.y1 * 288) + s.x1;

			if (editor.editSelectFnShiftWrap) {
				tail = editor.pixel.surface.slice(ptr, ptr + s.w);
			}

			for (let y = s.y1; y < s.y2; y++, ptr += 288) {
				editor.pixel.surface.copyWithin(ptr, ptr + 288, ptr + 288 + s.w);
			}

			editor.pixel.surface.set(tail, ptr);
		},

		'SHIFT_DIR_DN_PIX': (s: Selection) => {
			let tail = new Uint8ClampedArray(s.w);
			let ptr = (s.y2 * 288) + s.x1;

			if (editor.editSelectFnShiftWrap) {
				tail = editor.pixel.surface.slice(ptr, ptr + s.w);
			}

			for (let y = s.y2; y > s.y1; y--, ptr -= 288) {
				editor.pixel.surface.copyWithin(ptr, ptr - 288, ptr - 288 + s.w);
			}

			editor.pixel.surface.set(tail, ptr);
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
			const cw = Math.floor(s.w / 6);
			let pixPtr: number, atrPtr: number;

			pixPtr = (s.y1 * 288) + s.x1;
			atrPtr = (s.y1 * 48) + Math.floor(s.x1 / 6);

			if (editor.editSelectFnShiftWrap) {
				pixTail.set(editor.pixel.surface.slice(pixPtr, pixPtr + s.w), 0);
				pixTail.set(editor.pixel.surface.slice(pixPtr + 288, pixPtr + 288 + s.w), s.w);

				atrTail.set(editor.pixel.attrs.slice(atrPtr, atrPtr + cw), 0);
				atrTail.set(editor.pixel.attrs.slice(atrPtr + 48, atrPtr + 48 + cw), cw);
			}

			for (let y = s.y1; y <= (s.y2 - 2); y++, pixPtr += 288, atrPtr += 48) {
				editor.pixel.surface.copyWithin(pixPtr, pixPtr + 576, pixPtr + 576 + s.w);
				editor.pixel.attrs.copyWithin(atrPtr, atrPtr + 96, atrPtr + 96 + cw);
			}

			editor.pixel.surface.set(pixTail.slice(0, s.w), pixPtr);
			editor.pixel.surface.set(pixTail.slice(s.w), pixPtr + 288);

			editor.pixel.attrs.set(atrTail.slice(0, cw), atrPtr);
			editor.pixel.attrs.set(atrTail.slice(cw), atrPtr + 48);
		},

		'SHIFT_DIR_DN_ATT': (s: Selection) => {
			const pixTail = new Uint8ClampedArray(s.w * 2);
			const atrTail = new Uint8ClampedArray(s.w / 3);
			const cw = Math.floor(s.w / 6);
			let pixPtr: number, atrPtr: number;

			pixPtr = (s.y2 * 288) + s.x1;
			atrPtr = (s.y2 * 48) + Math.floor(s.x1 / 6);

			if (editor.editSelectFnShiftWrap) {
				pixTail.set(editor.pixel.surface.slice(pixPtr - 288, pixPtr - 288 + s.w), 0);
				pixTail.set(editor.pixel.surface.slice(pixPtr, pixPtr + s.w), s.w);

				atrTail.set(editor.pixel.attrs.slice(atrPtr - 48, atrPtr - 48 + cw), 0);
				atrTail.set(editor.pixel.attrs.slice(atrPtr, atrPtr + cw), cw);
			}

			for (let y = s.y2; y >= (s.y1 + 2); y--, pixPtr -= 288, atrPtr -= 48) {
				editor.pixel.surface.copyWithin(pixPtr, pixPtr - 576, pixPtr - 576 + s.w);
				editor.pixel.attrs.copyWithin(atrPtr, atrPtr - 96, atrPtr - 96 + cw);
			}

			editor.pixel.surface.set(pixTail.slice(0, s.w), pixPtr - 288);
			editor.pixel.surface.set(pixTail.slice(s.w), pixPtr);

			editor.pixel.attrs.set(atrTail.slice(0, cw), atrPtr - 48);
			editor.pixel.attrs.set(atrTail.slice(cw), atrPtr);
		},

		'SHIFT_DIR_LT_ATT': (s: Selection) => {
			let pixTail = new Uint8ClampedArray(6);
			let atrTail: number;
			let pixPtr: number, atrPtr: number;
			let x: number, y: number, k: number;

			pixPtr = s.y1 * 288;
			atrPtr = s.y1 * 48;

			for (y = s.y1; y <= s.y2; y++, pixPtr += 288, atrPtr += 48) {
				x = s.x1;
				k = x / 6;

				atrTail = 0;
				pixTail.fill(0);
				if (editor.editSelectFnShiftWrap) {
					pixTail = editor.pixel.surface.slice(pixPtr + x, pixPtr + x + 6);
					atrTail = editor.pixel.attrs[atrPtr + k];
				}

				for (; x <= s.x2 - 6; x += 6, k++) {
					editor.pixel.surface.copyWithin(pixPtr + x, pixPtr + x + 6, pixPtr + x + 12);
					editor.pixel.attrs[atrPtr + k] = editor.pixel.attrs[atrPtr + k + 1];
				}

				editor.pixel.surface.set(pixTail, pixPtr + x);
				editor.pixel.attrs[atrPtr + k] = atrTail;
			}
		},

		'SHIFT_DIR_RT_ATT': (s: Selection) => {
			let pixTail = new Uint8ClampedArray(6);
			let atrTail: number;
			let pixPtr: number, atrPtr: number;
			let x: number, y: number, k: number;

			pixPtr = s.y1 * 288;
			atrPtr = s.y1 * 48;

			for (y = s.y1; y <= s.y2; y++, pixPtr += 288, atrPtr += 48) {
				x = s.x2 - 5;
				k = Math.floor(x / 6);

				atrTail = 0;
				pixTail.fill(0);
				if (editor.editSelectFnShiftWrap) {
					pixTail = editor.pixel.surface.slice(pixPtr + x, pixPtr + x + 6);
					atrTail = editor.pixel.attrs[atrPtr + k];
				}

				for (; x >= s.x1 + 6; x -= 6, k--) {
					editor.pixel.surface.copyWithin(pixPtr + x, pixPtr + x - 6, pixPtr + x);
					editor.pixel.attrs[atrPtr + k] = editor.pixel.attrs[atrPtr + k - 1];
				}

				editor.pixel.surface.set(pixTail, pixPtr + x);
				editor.pixel.attrs[atrPtr + k] = atrTail;
			}
		}
	}
}
