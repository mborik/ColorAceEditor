/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2022 Martin Bórik
 */

export const APP_WRAPPER = () => document.querySelector('#wrapper') as HTMLDivElement;
export const OVERLAY_WRAPPER = () => document.querySelector('#overlays') as HTMLDivElement;
export const PROGRESS_BAR = () => document.querySelector('#progress') as HTMLHRElement;
export const STATUS_BAR = () => document.querySelector('#statusBar') as HTMLDivElement;
export const CANVAS = () => document.querySelector('#drawingCanvas') as HTMLCanvasElement;
export const UPLOAD = {
	CANVAS: () => document.querySelector('#uploadCanvas') as HTMLCanvasElement,
	INPUT: () => document.querySelector('#uploadFile') as HTMLInputElement,
};
