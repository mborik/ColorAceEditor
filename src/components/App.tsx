/*
 * PMD 85 ColorAce picture editor
 * App entry component
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import * as React from "react";
import { HotkeyConfig, useHotkeys } from "@blueprintjs/core";

import { HotkeyItems } from '../params/Hotkeys';
import { useEditor } from './EditorProvider';

import AboutDlg from './AboutDlg';
import Main from './Main';
import Navigation from './Navigation';
import ResultsDlg from './ResultsDlg';


const App: React.VFC = () => {
	const { dispatch, editor } = useEditor();
	const hotkeyItems = React.useMemo(() => {
		if (editor) {
			return HotkeyItems.map(({ handler, ...hotkeyConfig }) => ({
				...hotkeyConfig,
				onKeyDown(event) {
					const action = handler(editor, event);
					if (action) {
						dispatch(action);
					}
				},
			}) as HotkeyConfig);
		}
		return [];
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
