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

const Navigation: React.FunctionComponent = () => {
	return <nav>
		<Navbar className="bp3-dark">
			<Navbar.Group align="center">
				<Navbar.Heading>ColorACE Screen Editor</Navbar.Heading>
			</Navbar.Group>

			<fieldset>
				<legend>tool:</legend>
				<Toolbar />
				<DrawMode />
				<FillShape />
				<SelectTools />
			</fieldset>

			<fieldset>
				<legend>palette:</legend>
				<Palette />
			</fieldset>
		</Navbar>
	</nav>;
}

export default Navigation;
