/*
 * PMD 85 ColorAce picture editor
 * FileMenu component
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import * as React from 'react';
import { Button, Navbar, ButtonGroup, Classes } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';

import { actionLoadFile, actionSaveFile, actionCleanup } from '../actions';
import { OVERLAY_WRAPPER } from '../elements';
import { useEditor } from './EditorProvider';

const FileMenu: React.VFC = () => {
	const { dispatch } = useEditor();

	return (
		<Navbar.Group align="center">
			<ButtonGroup fill={true}>
				<Button
					id="TBFM_LOAD"
					key="TBFM_LOAD"
					icon="folder-shared-open"
					alignText="left"
					text="LOAD"
					onClick={() => {
						dispatch(actionLoadFile());
					}}
				/>
				<Button
					id="TBFM_SAVE"
					key="TBFM_SAVE"
					icon="floppy-disk"
					text="SAVE"
					onClick={() => {
						dispatch(actionSaveFile());
					}}
				/>
				<Popover2
					position="right-top"
					portalContainer={OVERLAY_WRAPPER()}
					content={
						<div id="popover-dlg">
							<h4>Clear viewport</h4>
							<p>Are you sure you want to clear current viewport?</p>
							<aside>
								<Button text="CANCEL" className={Classes.POPOVER_DISMISS} />
								<Button text="CLEAR" className={Classes.POPOVER_DISMISS}
									intent='danger'
									onClick={() => {
										dispatch(actionCleanup());
									}}
								/>
							</aside>
						</div>
					}
					renderTarget={({ isOpen, ref, ...targetProps }) => (
						<Button
							{...targetProps}
							elementRef={ref}
							active={isOpen}
							id="TBFM_NEW"
							key="TBFM_NEW"
							icon="trash"
							text="NEW"
						/>
					)}
				/>
			</ButtonGroup>
		</Navbar.Group>
	);
};

export default FileMenu;
