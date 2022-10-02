/*
 * PMD 85 ColorAce picture editor
 * Navigation panel component
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import React, { useCallback } from 'react';
import { Navbar, Icon } from "@blueprintjs/core";
import { actionAbout } from '../actions/base';

import Toolbar from './Toolbar';
import DrawMode from './DrawMode';
import FillShape from './FillShape';
import BrushShape from './BrushShape';
import SelectTools from './SelectTools';
import Palette from './Palette';
import FileMenu from './FileMenu';
import Extras from './Extras';
import { useEditor } from './EditorProvider';


const Navigation: React.VFC = () => {
	const { dispatch } = useEditor();
	const handleOpenAboutDlg = useCallback(
		() => dispatch(actionAbout(true)),
	[ dispatch ]);

	return <nav>
		<Navbar className="bp4-dark">
			<Navbar.Group align="center" onClick={handleOpenAboutDlg}>
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
	</nav>
}

export default Navigation;
