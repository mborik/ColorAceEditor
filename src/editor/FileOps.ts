/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Uploader - processing of uploaded file
 *
 * Copyright (c) 2019 Martin Bórik
 */

import { editor } from "./Editor";


export class FileOps {
	constructor(public uploadCanvas: HTMLCanvasElement) {
		if (!(uploadCanvas instanceof HTMLCanvasElement)) {
			throw Error("ColorAceEditor: Image render canvas element not defined!");
		}
	}

	private getPixelValue(ctx: CanvasRenderingContext2D, x: number, y: number) {
		const pix = ctx.getImageData(x, y, 1, 1).data;

		const diff = editor.pixel.pal.map(base => Math.sqrt(
			(pix[0] - base[4]) * (pix[0] - base[4]) +
			(pix[1] - base[5]) * (pix[1] - base[5]) +
			(pix[2] - base[6]) * (pix[2] - base[6])
		));

		return diff.indexOf(Math.min.apply(Math, diff));
	}

	private countMostFrequent(arr: number[]) {
		const counts = {};
		arr.forEach(v => {
			if (v > 0)
				counts[v] = (counts[v] || 0) + 1;
		});

		let result = 0, max = 0;
		for (const c in counts) {
			if (counts[c] > max) {
				max = counts[c];
				result = +c;
			}
		}

		return result;
	}

	/**
	 * Read the selected file with `FileReader`. Binary file of length 16384 will be
	 * processed as standard screen-dump. In case of standard images with dimensions
	 * 288x256 (or lower) it will be converted by complex algorithm with proper
	 * color attribute matching.
	 *
	 * @param {File} file
	 * @returns {Promise}
	 */
	upload(file: File): Promise<void> {
		return new Promise((resolve, reject) => {
			if (file == null) {
				return reject('not a file');
			}

			try {
				const fr = new FileReader();

				if (typeof file.type === 'string' && file.type.indexOf('image/') === 0) {
					fr.onload = () => {
						let img = new Image();

						img.onload = () => {
							if (img.width > 288 || img.height > 256) {
								return reject('invalid image dimensions');
							}

							editor.pixel.doSnapshot();
							editor.pixel.clearViewport();

							const cols = Math.ceil(img.width / 6);
							const rows = Math.ceil(img.height / 2) * 2;

							this.uploadCanvas.width = cols * 6;
							this.uploadCanvas.height = rows;

							const ctx = this.uploadCanvas.getContext("2d");

							ctx.fillStyle = "black";
							ctx.fill();
							ctx.drawImage(img, 0, 0);

							const attr: number[] = new Array(12);
							let i: number, c: number, x: number;

							for (let y = 0; y < rows; y += 2) {
								for (let cx = 0; cx < cols; cx++) {
									for (x = (cx * 6), i = 0; i < 6; i++, x++) {
										attr[i]     = this.getPixelValue(ctx, x, y);
										attr[i + 6] = this.getPixelValue(ctx, x, y + 1);
									}

									c = this.countMostFrequent(attr);
									i = Math.floor((y * 48) + cx);

									editor.pixel.attrs[i]      = editor.pixel.pal[c][7];
									editor.pixel.attrs[i + 48] = editor.pixel.pal[c][8];

									x = (y * 288) + (cx * 6);
									for (i = 0; i < 6; i++, x++) {
										editor.pixel.surface[x]       = attr[i] ? c : 0;
										editor.pixel.surface[x + 288] = attr[i + 6] ? c : 0;
									}
								}
							}

							editor.refresh();
							resolve();
						};

						img.src = fr.result as string;
					};

					fr.readAsDataURL(file);
				}
				else if (file.size === 16384) {
					fr.onload = () => {
						const b = new Uint8Array(fr.result as ArrayBuffer);

						editor.pixel.doSnapshot();
						editor.pixel.readPMD85vram(b);
						editor.refresh();

						resolve();
					};

					fr.readAsArrayBuffer(file);
				}
				else {
					reject('not an image file or PMD-85 screen');
				}
			}
			catch (e) {
				reject(`fatal error: ${e}`);
			}
		});
	}

	/**
	 * Create VRAM dump in PMD 85 format and provide download of the binary file.
	 */
	download(filename: string = 'screen.bin'): void {
		const type = 'application/octet-stream';
		const bin = new Uint8Array(16384);

		for (let i = 0, j = 0, k = 0, src = 0; i < 16384;) {
			for (j = 0; j < 48; j++, i++) {
				bin[i] =
					(editor.pixel.surface[src++] ? 0x01 : 0) |
					(editor.pixel.surface[src++] ? 0x02 : 0) |
					(editor.pixel.surface[src++] ? 0x04 : 0) |
					(editor.pixel.surface[src++] ? 0x08 : 0) |
					(editor.pixel.surface[src++] ? 0x10 : 0) |
					(editor.pixel.surface[src++] ? 0x20 : 0) |
					(editor.pixel.attrs[k++] << 6);
			}

			i += 16;
		}


		let blob: Blob = null;

		try {
			blob = new Blob([ bin ], { type });
		}
		catch (ex) {
			console.error(ex);

			try {
				// @ts-ignore
				const bb = new (BlobBuilder || WebKitBlobBuilder || MozBlobBuilder)();

				bb.append(bin);
				blob = bb.getBlob(type);
			}
			catch (ex2) {
				console.error(ex2);
				blob = null;
			}
		}

		if (blob) {
			try {
				if (navigator && navigator.msSaveOrOpenBlob) { // for IE
					navigator.msSaveOrOpenBlob(blob, encodeURIComponent(filename));

				} else {
					const url = URL.createObjectURL(blob);
					const downloadLink = document.createElement('a');
					const parentElement = this.uploadCanvas.parentElement;

					downloadLink.href = url;
					downloadLink.setAttribute('download', encodeURIComponent(filename));

					parentElement.appendChild(downloadLink);
					downloadLink.click();

					setTimeout(function () {
						// revoking of created url and anchor removal...
						URL.revokeObjectURL(url);
						downloadLink.remove();
					}, 2000);
				}
			}
			catch (ex) {
				console.error(ex);
			}
		}
	}
}
