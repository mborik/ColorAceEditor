/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Uploader - processing of uploaded file
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import { UPLOAD } from '../elements';
import { countMostFrequent } from '../utils';
import { Editor } from './Editor';
import { EditorSpriteDimensions } from './Pixelator';


export class FileOps {
  public uploadCanvas: HTMLCanvasElement;

  constructor() {
    this.uploadCanvas = UPLOAD.CANVAS();
    if (!(this.uploadCanvas instanceof HTMLCanvasElement)) {
      throw Error('ColorAceEditor: Image render canvas element not defined!');
    }
  }

  /**
   * Read the selected file with `FileReader`. Binary file of length 16384 will be
   * processed as standard screen-dump. In case of standard images with dimensions
   * 288x256 (or lower) it will be converted by complex algorithm with proper
   * color attribute matching.
   */
  upload(this: Editor, file: File, updateProgress?: (amount: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (file == null) {
        return reject('not a file');
      }

      try {
        const { pixel } = this;
        const fr = new FileReader();

        if (typeof file.type === 'string' && file.type.indexOf('image/') === 0) {
          fr.onload = () => {
            const img = new Image();

            img.onload = () => {
              if (img.width > 288 || img.height > 256) {
                return reject('invalid image dimensions (supported up to 288x256)');
              }

              pixel.doSnapshot();
              pixel.clearViewport();

              const cols = Math.ceil(img.width / 6);
              const rows = Math.ceil(img.height / 2) * 2;
              const width = cols * 6;
              const rowlen = width * 4;

              this.uploadCanvas.width = width;
              this.uploadCanvas.height = rows;

              const ctx = this.uploadCanvas.getContext('2d');
              if (!ctx) {
                return reject('unexpected error!');
              }

              ctx.fillStyle = 'black';
              ctx.fill();
              ctx.drawImage(img, 0, 0);

              const bmp = ctx.getImageData(0, 0, width, rows);
              const bmpClamp = new Uint8ClampedArray(bmp.data);

              const getPixelValue = (bmpClamp: Uint8ClampedArray, ptr: number) => {
                const [R, G, B] = bmpClamp.slice(ptr, ptr + 3).map(v => v < 128 ? 0 : 255);
                return pixel.pal.findIndex(
                  ([,,,, palR, palG, palB]) => R === palR && G === palG && B === palB
                );
              };

              let y = 0;
              const loopY = () => {
                const attr: number[] = new Array(12);
                let i: number, c: number, x: number, ptr: number;

                for (let cx = 0; cx < cols; cx++) {
                  for (ptr = (cx * 6 * 4) + (y * rowlen), i = 0; i < 12; ptr += 4) {
                    attr[i++] = getPixelValue(bmpClamp, ptr);
                    attr[i++] = getPixelValue(bmpClamp, ptr + rowlen);
                  }

                  i = (y * 48) + cx;
                  c = countMostFrequent(attr);

                  pixel.attrs[i] = pixel.pal[c][7];
                  pixel.attrs[i + 48] = pixel.pal[c][8];

                  x = (y * 288) + (cx * 6);
                  for (i = 0; i < 12; x++) {
                    pixel.surface[x] = attr[i++] ? c : 0;
                    pixel.surface[x + 288] = attr[i++] ? c : 0;
                  }
                }

                if (typeof updateProgress === 'function') {
                  updateProgress(y / rows);
                }

                y += 2;
                if (y < rows) {
                  requestAnimationFrame(loopY);
                }
                else {
                  this.refresh();

                  if (typeof updateProgress === 'function') {
                    updateProgress(1);
                  }

                  resolve();
                }
              };

              loopY();
            };

            img.src = fr.result as string;
          };

          fr.readAsDataURL(file);
        }
        else if (file.size === 16384) {
          fr.onload = () => {
            const b = new Uint8Array(fr.result as ArrayBuffer);

            pixel.doSnapshot();
            pixel.readPMD85vram(b);
            this.refresh();

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
  download(this: Editor, filename: string, dimensions?: EditorSpriteDimensions): void {
    const type = 'application/octet-stream';
    const bin = dimensions ?
      this.pixel.prepareSprite(dimensions) :
      this.pixel.preparePMD85vram();

    let blob: Nullable<Blob> = null;
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
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        const parentElement = this.uploadCanvas.parentElement;

        downloadLink.href = url;
        downloadLink.setAttribute('download', encodeURIComponent(filename));

        parentElement?.appendChild(downloadLink);
        downloadLink.click();

        setTimeout(function() {
          // revoking of created url and anchor removal...
          URL.revokeObjectURL(url);
          downloadLink.remove();
        }, 2000);
      }
      catch (ex) {
        console.error(ex);
      }
    }
  }

  /**
   * Render current screen into clipboard as image.
   */
  copyToClipboard(this: Editor, type = 'image/png'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!(navigator?.clipboard instanceof Clipboard)) {
        return reject('clipboard not available');
      }

      const lastZoomFactor = this.zoomFactor;
      this.pixel.render(0, 0, 1);

      try {
        this.canvas.toBlob((blob) => {
          if (!(blob instanceof Blob)) {
            return reject('unexpected error!');
          }

          navigator.clipboard.write([
            new ClipboardItem({ [type]: blob })
          ]).then(() => {
            this.zoomFactor = lastZoomFactor;
            this.refresh();
            resolve();
          }).catch((e) => {
            reject(`unexpected error: ${e}`);
          });
        }, type, /* quality */ 1);
      }
      catch (e) {
        reject(`fatal error: ${e}`);
      }
    });
  }
}