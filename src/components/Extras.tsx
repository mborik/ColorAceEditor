/*
 * PMD 85 ColorAce picture editor
 * FileMenu component
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import * as React from 'react';
import { Button, ButtonGroup, KeyCombo, Menu, MenuItem, Navbar, Position } from '@blueprintjs/core';
import { Popover2, Tooltip2 } from '@blueprintjs/popover2';

import { actionToggleGuides, actionUndo } from '../actions/base';
import { actionImportScreen } from '../actions/importScreen';
import constants from '../params/constants';
import database from '../params/screen.db';
import { OVERLAY_WRAPPER } from '../params/querySelectors';
import { useEditor } from './EditorProvider';


const Extras: React.VFC = () => {
	const { dispatch, editor } = useEditor();
	const portalContainer = OVERLAY_WRAPPER();

	return editor ? (
		<>
			<Navbar.Group align="center">
				<ButtonGroup fill={true}>
					<Popover2
						position="bottom-left"
						modifiers={{ arrow: { enabled: false } }}
						portalContainer={portalContainer}
						content={
							<Menu>
								{database.map((item, key) => (
									<MenuItem
										key={`MNXI_${key}`}
										text={item.name}
										label={`[ ${item.author} ]`}
										onClick={() => {
											actionImportScreen({ dispatch, editor, fileName: item.filename });
										}}
									/>
								))}
							</Menu>
						}
						renderTarget={({ isOpen, ref, ...targetProps }) => (
							<Button
								{...targetProps}
								elementRef={ref}
								active={isOpen}
								id="TBEX_IMPORT"
								key="TBEX_IMPORT"
								icon="database"
								rightIcon="caret-down"
								text="IMPORT"
							/>
						)}
					/>
					<Tooltip2
						key="TBEX_UNDO_TT"
						position={Position.BOTTOM_RIGHT}
						hoverOpenDelay={constants.TOOLTIP_TIMEOUT}
						portalContainer={portalContainer}
						content={<>
							<label>undo</label>
							<KeyCombo combo="cmd+Z" />
						</>}
						renderTarget={({ isOpen: _, ref: elementRef, ...targetProps }) => (
							<Button
								{...targetProps}
								elementRef={elementRef}
								id="TBEX_UNDO"
								key="TBEX_UNDO"
								icon="undo"
								text="UNDO"
								onClick={() => {
									dispatch(actionUndo());
								}}
							/>
						)}
					/>
					<Tooltip2
						key="TBEX_GUIDES_TT"
						position={Position.BOTTOM_RIGHT}
						hoverOpenDelay={constants.TOOLTIP_TIMEOUT}
						portalContainer={portalContainer}
						content={<>
							<label>toggle guidelines</label>
							<KeyCombo combo="cmd+G" />
						</>}
						renderTarget={({ isOpen: _, ref: elementRef, ...targetProps }) => (
							<Button
								{...targetProps}
								elementRef={elementRef}
								id="TBEX_GUIDES"
								key="TBEX_GUIDES"
								icon="grid"
								active={editor.showGuides}
								intent={editor.showGuides ? 'primary' : 'none'}
								onClick={() => {
									dispatch(actionToggleGuides());
								}}
							/>
						)}
					/>
				</ButtonGroup>
			</Navbar.Group>
		</>
	) : null;
};

export default Extras;
