/*
 * PMD 85 ColorAce picture editor
 * Navigation panel component
 *
 * Copyright (c) 2019 Martin Bórik
 */

import React from 'react';
import { Navbar } from "@blueprintjs/core";
import Toolbar from './Toolbar';
import DrawMode from './DrawMode';
import FillShape from './FillShape';
import SelectTools from './SelectTools';
import Palette from './Palette';
import FileMenu from './FileMenu';

const Navigation: React.FunctionComponent = () => {
	return <nav>
		<Navbar className="bp3-dark">
			<Navbar.Group align="center">
				<Navbar.Heading>ColorACE Screen Editor</Navbar.Heading>
			</Navbar.Group>

			<fieldset key="NAV_TOOL">
				<legend>tool:</legend>
				<Toolbar />
				<DrawMode />
				<FillShape />
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
		</Navbar>
	</nav>;
}

export default Navigation;
