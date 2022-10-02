/*
 * PMD 85 ColorAce picture editor
 * Simple About dialog component
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import React from 'react';
import { Button, Classes, Dialog } from "@blueprintjs/core";
import { actionAbout } from '../actions/base';
import { useEditor } from './EditorProvider';

/**
 * Helper React element which generates external anchor link.
 */
const Link = (prop: any) => (
	<a target="_blank" rel="noopener noreferrer" href={prop.href}>
		{prop.text || prop.children}
	</a>
);

const AboutDlg: React.VFC = () => {
	const { dispatch, aboutDialogOpen } = useEditor();

	return <Dialog
		className="about-dlg"
		isOpen={aboutDialogOpen}
		onClose={() => dispatch(actionAbout(false))}>

		<div className={Classes.DIALOG_BODY}>
			<img src="logo.png" alt="ColorACE Screen Editor" />
			<h2>Screen Editor <span className="app-version">v{
				process.env.REACT_APP_VERSION
			}</span></h2>

			<p>Online pixelart screen editor for <b><Link
					href="https://pmd85.borik.net/" text="Tesla PMD 85" /></b>,<br />
				an 8-bit personal micro-computer produced in eighties
				of 20th century in former Czechoslovakia.</p>

			<p>Copyright &copy; 2012-2022 <Link
				href="https://github.com/mborik" text="Martin Bórik" /></p>

			<hr />
			<div className={Classes.DIALOG_FOOTER}>
				<p>Built on <Link href="https://reactjs.org/" text="React" />
					and&nbsp;
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
						onClick={() => dispatch(actionAbout(false))}>OK</Button>
				</div>
			</div>
		</div>
	</Dialog>;
}

export default AboutDlg;
