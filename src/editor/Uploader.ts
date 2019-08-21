/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Uploader - processing of uploaded file
 *
 * Copyright (c) 2019 Martin Bórik
 */

import { editor } from "./Editor";


declare type UploadCallback = (result: { success?: boolean, error?: string }) => {};

export class Uploader {
	private uploadCtx: CanvasRenderingContext2D;

	constructor(private uploadCanvas?: HTMLCanvasElement) {
		if (uploadCanvas instanceof HTMLCanvasElement) {
			this.uploadCtx = uploadCanvas.getContext("2d") as CanvasRenderingContext2D;
		} else {
			console.error("ColorAceEditor: Image render canvas element not defined!");
		}
	}

	private getPixelValue(x: number, y: number) {
		const pix = this.uploadCtx.getImageData(x, y, 1, 1).data;

		return Math.round((
			Math.round(pix[0] * 299) +
			Math.round(pix[1] * 587) +
			Math.round(pix[2] * 114)
		) / 1000);
	}

	uploader(file: File, callback: UploadCallback) {
		if (file == null) {
			return;
		}

		try {
			const fr = new FileReader();

			if (typeof file.type === 'string' && file.type.indexOf('image/') === 0) {
				fr.onload = () => {
					let img = new Image();

					img.onload = () => {
						if (img.width > 288 || img.height > 256)
							callback({ error: 'invalid image dimensions' });

						this.uploadCanvas.width = img.width;
						this.uploadCanvas.height = img.height;
						this.uploadCtx.drawImage(img, 0, 0);

						for (let y = 0; y < img.height; y++) {
							for (let x = 0; x < img.width; x++) {
								editor.pixel.surface[(y * 288) + x] = this.getPixelValue(x, y) ? 7 : 0;
							}
						}

						editor.scroller.zoomTo(editor.zoomFactor);
						callback({ success: true });
					};

					img.src = fr.result as string;
				};

				fr.readAsDataURL(file);
			}
			else if (file.size === 16384) {
				fr.onload = () => {
					const b = new Uint8Array(fr.result as ArrayBuffer);

					editor.pixel.readPMD85vram(b);
					editor.scroller.zoomTo(editor.zoomFactor);

					callback({ success: true });
				};

				fr.readAsArrayBuffer(file);
			}
			else {
				callback({ error: 'not an image file or PMD-85 screen' });
			}
		}
		catch (e) {
			console.error(e);
		}
	}
}
