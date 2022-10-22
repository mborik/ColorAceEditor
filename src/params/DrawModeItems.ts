/*
 * PMD 85 ColorAce picture editor
 * Drawing mode toolbar item definitions
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import { EditorDrawMode } from '../editor';


export interface DrawModeItem {
  /** Unique identifier */
  id: EditorDrawMode;

  /** Button caption */
  caption: string;

  /** Tooltip */
  title: string;

  /** Key combo */
  hotkey: string;

  /** Currently active button flag */
  active?: boolean;
}

export const DrawModeItems: DrawModeItem[] = [{
  id: EditorDrawMode.Reset,
  caption: 'RES',
  title: 'reset',
  hotkey: 'X'
}, {
  id: EditorDrawMode.Set,
  caption: 'SET',
  title: 'set',
  hotkey: 'X'
}, {
  id: EditorDrawMode.Over,
  caption: 'OVR',
  title: 'over',
  hotkey: 'Z'
}, {
  id: EditorDrawMode.Color,
  caption: 'COL',
  title: 'colorize',
  hotkey: 'C'
}];
