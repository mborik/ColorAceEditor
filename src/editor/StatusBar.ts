/*
 * PMD 85 ColorAce picture editor
 * ColorAceEditor.Uploader - processing of uploaded file
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import { STATUS_BAR } from '../elements';
import { pad } from '../utils';
import { Editor, EditorTool } from './Editor';
import { FileOps } from './FileOps';


export interface RedrawStatusBarParams {
  viewportX?: number;
  viewportY?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  zoom?: number;
}

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
  redrawStatusBar(this: Editor, {
    viewportX, viewportY,
    x1, y1, x2, y2,
    zoom = this.zoomFactor
  }: RedrawStatusBarParams) {
    let coords: string = '';

    if (viewportX && viewportY) {
      let { x, y, column } = this.translateCoords(viewportX, viewportY);

      let a: Optional<string>;
      if (x >= 0 && x < 288 && y >= 0 && y < 256) {
        a = `${(49152 + (y * 64) + column).toString(16).toUpperCase()}h`;
      }
      else {
        // @ts-ignore
        x = y = column = undefined;
      }

      coords = `\n X:${pad(x, 3)}  Y:${pad(y, 3)}  C:${pad(column, 2)}  [${pad(a, 5)}] `;
    }
    else if (x1 != null && y1 != null && x2 != null && y2 != null) {
      let w: Optional<number> = (x2 + 1) - x1;
      let h: Optional<number> = (y2 + 1) - y1;

      if (w >= 288) {
        w = undefined;
      }
      if (h >= 256) {
        h = undefined;
      }
      if (x1 < 0 || x1 >= 288) {
        x1 = undefined;
      }
      if (y1 < 0 || y1 >= 256) {
        y1 = undefined;
      }

      coords = `\n X:${pad(x1, 3)}  Y:${pad(y1, 3)}  W:${pad(w, 3)}  H:${pad(h, 3)} `;
    }

    this.statusBar.textContent =
      `ZOOM: ${pad(zoom * 100, 4)}%  TOOL: ${this.editTool.substring(5)}${coords}`
        .replace(/ /g, '\u00A0');
  }

  redrawStatusBarAfterToolChanged(this: Editor) {
    let statusBarParams: RedrawStatusBarParams = {
      viewportX: -Infinity, viewportY: -Infinity
    };

    if (this.editTool === EditorTool.Selection ||
        this.editTool === EditorTool.AttrSelect) {

      const { x1, y1, x2, y2 } = this.selection;
      statusBarParams = x1 < x2 && y1 < y2 ? { x1, y1, x2, y2 } : {};
    }

    this.redrawStatusBar(statusBarParams);
  }
}
