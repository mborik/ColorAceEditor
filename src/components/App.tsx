/*
 * PMD 85 ColorAce picture editor
 * App entry component
 *
 * Copyright (c) 2019 Martin Bórik
 */

import React from 'react';
import { Dispatch } from 'redux';
import { Hotkey, Hotkeys, HotkeysTarget } from "@blueprintjs/core";
import Navigation from './Navigation';
import Main from './Main';

import { HotkeyItems } from '../params/Hotkeys';
import { EditorReducerState, EditorRootAction } from '../reducers/editor';


interface ReducerStoreProps {
	dispatch: Dispatch;
	getState: () => EditorReducerState;
}

class App extends React.PureComponent<ReducerStoreProps, {}> {
	render() {
		return <>
			<Navigation />
			<Main />
		</>;
	}

	renderHotkeys() {
		return <Hotkeys>
			{HotkeyItems.map(hk => {
				return <Hotkey {...hk} onKeyDown={(event: KeyboardEvent) => {
					const editor = this.props.getState()['editor'];
					if (editor) {
						const action: EditorRootAction = hk.handler(editor, event);
						if (action) {
							this.props.dispatch(action);
						}
					}
				}} />
			})}
		</Hotkeys>;
	}
}

/*
 * This is workaround to strange issue with HotkeysTarget decorator from
 * https://github.com/palantir/blueprint/issues/2972#issuecomment-441102927
 */
function AppWrapper() {} // tslint:disable-line no-empty
AppWrapper.prototype = Object.create(App.prototype);
export default HotkeysTarget<AppWrapper>(AppWrapper);
