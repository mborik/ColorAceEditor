/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2022 Martin Bórik
 */

import { queryElement } from './utils';


export const APP_WRAPPER = () => queryElement<HTMLDivElement>('#wrapper');
export const OVERLAY_WRAPPER = () => queryElement<HTMLDivElement>('#overlays');
export const PROGRESS_BAR = () => queryElement<HTMLHRElement>('#progress');
export const STATUS_BAR = () => queryElement<HTMLDivElement>('#statusBar');
export const CANVAS = () => queryElement<HTMLCanvasElement>('#drawingCanvas');
export const UPLOAD = {
  CANVAS: () => queryElement<HTMLCanvasElement>('#uploadCanvas'),
  INPUT: () => queryElement<HTMLInputElement>('#uploadFile'),
};
