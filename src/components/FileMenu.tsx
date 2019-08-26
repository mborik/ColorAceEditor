/*
 * PMD 85 ColorAce picture editor
 * FileMenu component
 *
 * Copyright (c) 2019 Martin Bórik
 */

import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Navbar, ButtonGroup, Popover, Classes } from "@blueprintjs/core";
import { actionSaveFile, actionCleanup } from '../actions/editor';

const FileMenu: React.FunctionComponent = () => {
	const dispatch = useDispatch();
	const handleClickLoad = useCallback((e: React.MouseEvent) => {
		const uploadFileElement = document.getElementById('uploadFile') as HTMLCanvasElement;

		e.preventDefault();
		return uploadFileElement.click();
	}, []);

	const handleClickSave = useCallback(
		(e: React.MouseEvent) => dispatch(actionSaveFile()),
	[ dispatch ]);

	const handleClickNew = useCallback(
		(e: React.MouseEvent) => dispatch(actionCleanup()),
	[ dispatch ]);

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
					onClick={handleClickSave}
				/>
				<Popover position="right-top">
					<Button
						key="TBFM_NEW"
						icon="trash"
						text="NEW"
					/>
					<div id="popover-dlg">
						<h4>Clear viewport</h4>
						<p>Are you sure you want to clear current viewport?</p>
						<aside>
							<Button text="CANCEL" className={Classes.POPOVER_DISMISS} />
							<Button text="CLEAR" className={Classes.POPOVER_DISMISS}
								intent='danger'
								onClick={handleClickNew}
							/>
						</aside>
					</div>
				</Popover>
			</ButtonGroup>
		</Navbar.Group>
	);
}

export default FileMenu;
