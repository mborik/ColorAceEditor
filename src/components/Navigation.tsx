/*
 * PMD 85 ColorAce picture editor
 * Navigation panel component
 *
 * Copyright (c) 2019 Martin Bórik
 */

import React from 'react';
import { Button, Classes, Dialog, Navbar, Icon } from "@blueprintjs/core";
import { useDispatch, useSelector } from 'react-redux';
import { EditorReducerState } from '../reducers/editor';
import { actionAbout } from '../actions/editor';

import Toolbar from './Toolbar';
import DrawMode from './DrawMode';
import FillShape from './FillShape';
import BrushShape from './BrushShape';
import SelectTools from './SelectTools';
import Palette from './Palette';
import FileMenu from './FileMenu';


const Link = (prop) => (
	<a target="_blank" rel="noopener noreferrer" href={prop.href}>
		{prop.text || prop.children}
	</a>
);

const Navigation: React.FunctionComponent = () => {
	const dispatch = useDispatch();
	const aboutDialogOpen = useSelector(
		(state: EditorReducerState) => state.aboutDialogOpen
	);

	const handleAboutDialog = (open: boolean) => dispatch(actionAbout(open));

	return <>
		<Dialog className="about-dlg" isOpen={aboutDialogOpen}
			onClose={() => handleAboutDialog(false)}>

			<div className={Classes.DIALOG_BODY}>
				<img src="logo.png" alt="ColorACE Screen Editor" />
				<h2>Screen Editor <span className="app-version">v{
					process.env.REACT_APP_VERSION
				}</span></h2>

				<p>Online pixelart screen editor for <b><Link
						href="https://pmd85.borik.net/" text="Tesla PMD 85" /></b>,<br />
					an 8-bit personal micro-computer produced in eighties
					of 20th century in former Czechoslovakia.</p>

				<p>Copyright &copy; 2012-2019 <Link
					href="https://github.com/mborik" text="Martin Bórik" /></p>

				<hr />
				<div className={Classes.DIALOG_FOOTER}>
					<p>Built on <Link href="https://reactjs.org/" text="React" />+
						<Link href="https://redux.js.org/" text="Redux" /> and&nbsp;
						<Link href="https://blueprintjs.com/"
							text="BlueprintJS UI framework" />.<br />
						Licensed under the MIT license.
					</p>

					<div className={Classes.DIALOG_FOOTER_ACTIONS}>
						<Link href="https://github.com/mborik/ColorAceEditor">
							<Button icon="git-merge" intent="success">
								github.com/mborik/ColorAceEditor
							</Button>
						</Link>

						<Button intent="primary"
							onClick={() => handleAboutDialog(false)}>OK</Button>
					</div>
				</div>
			</div>
		</Dialog>

		<nav><Navbar className="bp3-dark">
			<Navbar.Group align="center" onClick={() => handleAboutDialog(true)}>
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

			<fieldset key="NAV_FILE">
				<legend>file:</legend>
				<FileMenu />
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
		</Navbar></nav>
	</>;
}

export default Navigation;
