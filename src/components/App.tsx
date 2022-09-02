/*
 * PMD 85 ColorAce picture editor
 * App entry component
 *
 * Copyright (c) 2019 Martin Bórik
 */

import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HotkeyConfig, useHotkeys } from "@blueprintjs/core";

import { HotkeyItems } from '../params/Hotkeys';
import { EditorReducerState } from '../reducers/editor';

import AboutDlg from './AboutDlg';
import Main from './Main';
import Navigation from './Navigation';
import ResultsDlg from './ResultsDlg';


const App: React.FunctionComponent = () => {
	const dispatch = useDispatch();
	const { editor } = useSelector((state: EditorReducerState) => state);
	const hotkeyItems = useMemo(() => {
		if (editor) {
			return HotkeyItems.map(({ handler, ...hotkeyConfig }) => ({
				...hotkeyConfig,
				onKeyDown(event) {
					const action = handler(editor, event);
					if (action) {
						dispatch(action);
					}
				},
			}) as HotkeyConfig)
		}
		return []
	}, [editor])

	const { handleKeyDown, handleKeyUp } = useHotkeys(hotkeyItems);

	return (
		<main onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
			<hr hidden id="progress" />
			<AboutDlg />
			<ResultsDlg />
			<Navigation />
			<Main />
		</main>
	);
}

export default App;
