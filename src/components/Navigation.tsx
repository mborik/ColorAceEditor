import React from 'react';
import { Navbar } from "@blueprintjs/core";
import Toolbar from './Toolbar';

const Navigation: React.FunctionComponent = () => {
	return <nav>
		<Navbar className="bp3-dark">
			<Navbar.Group align="center">
				<Navbar.Heading>ColorACE Screen Editor</Navbar.Heading>
			</Navbar.Group>

			<Toolbar />
		</Navbar>
	</nav>;
}

export default Navigation;
