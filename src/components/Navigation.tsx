/*
 * PMD 85 ColorAce picture editor
 * Navigation panel component
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import * as React from 'react';
import { Icon, Navbar } from '@blueprintjs/core';
import { actionAbout } from '../actions';

import { useEditor } from '../editor';
import BrushShape from './BrushShape';
import DrawMode from './DrawMode';
import Extras from './Extras';
import FileMenu from './FileMenu';
import FillShape from './FillShape';
import Palette from './Palette';
import SelectTools from './SelectTools';
import Toolbar from './Toolbar';


const Navigation: React.VFC = () => {
	const { dispatch } = useEditor();

	return <nav>
		<Navbar className="bp4-dark">
			<Navbar.Group align="center" onClick={() => {
				dispatch(actionAbout(true));
			}}>
				<Navbar.Heading>ColorACE Screen Editor</Navbar.Heading>
			</Navbar.Group>

			<fieldset key="NAV_TOOL">
				<legend>tool:</legend>
				<Toolbar />
				<DrawMode />
				<FillShape />
				<BrushShape />
				<SelectTools />
			</fieldset>

			<fieldset key="NAV_PAL">
				<legend>palette:</legend>
				<Palette />
			</fieldset>

			<fieldset key="NAV_OPS">
				<legend>operations:</legend>
				<FileMenu />
				<Extras />
			</fieldset>

			<fieldset key="NAV_HELP" className="help">
				<section>
					<Icon icon="hand-up" iconSize={12} tagName="i" />
					<span><b>left:</b> draw</span>
					<span><b>right/mid:</b> pan</span>
					<span><b>wheel:</b> zoom</span>
				</section>
				<section>
					<Icon icon="help" iconSize={12} tagName="i" />
					<span>press <kbd>?</kbd> key for dialog with all editor hotkeys</span>
				</section>
			</fieldset>

			<footer id="statusBar"></footer>
		</Navbar>
	</nav>;
};

export default Navigation;
