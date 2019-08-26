/*
 * PMD 85 ColorAce picture editor
 * FileMenu component
 *
 * Copyright (c) 2019 Martin Bórik
 */

import React from 'react';
import { Button, Navbar, ButtonGroup } from "@blueprintjs/core";

const FileMenu: React.FunctionComponent = () => {
	const handleClickLoad = () => {
		const uploadFile = document.getElementById('uploadFile') as HTMLCanvasElement;
		uploadFile.click();
	};

	return (
		<Navbar.Group align="center">
			<ButtonGroup fill={true}>
				<Button
					key="TBFM_LOAD"
					icon="folder-shared-open"
					text="LOAD"
					onClick={handleClickLoad}
				/>
				<Button
					key="TBFM_SAVE"
					icon="floppy-disk"
					text="SAVE"
				/>
				<Button
					key="TBFM_NEW"
					icon="trash"
					text="NEW"
				/>
			</ButtonGroup>
		</Navbar.Group>
	);
}

export default FileMenu;
