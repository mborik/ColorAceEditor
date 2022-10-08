/*
 * PMD 85 ColorAce picture editor
 * FileMenu component
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import * as React from 'react';
import { Button, ButtonGroup, KeyCombo, Menu, MenuDivider, MenuItem, Navbar, Position } from '@blueprintjs/core';
import { Popover2, Tooltip2 } from '@blueprintjs/popover2';

import { actionColorModeChanged, actionToggleGuides, actionUndo } from '../actions/base';
import { actionImportScreen } from '../actions/importScreen';
import constants from '../params/constants';
import database from '../params/screen.db';
import { OVERLAY_WRAPPER } from '../params/querySelectors';
import { ColorModeItems } from '../params/ColorMode';
import { useEditor } from './EditorProvider';


const Extras: React.VFC = () => {
	const { dispatch, editor } = useEditor();
	const portalContainer = OVERLAY_WRAPPER();

	return editor ? (
		<>
			<Navbar.Group align="center">
				<ButtonGroup fill={true}>
					<Popover2
						position={Position.BOTTOM_LEFT}
						portalContainer={portalContainer}
						content={
							<Menu>
								<MenuDivider title="Screen Color Mode" />
								{ColorModeItems.map((item) => (
									<MenuItem
										key={item.id}
										id={item.id}
										icon={item.id === editor.editColorMode ? 'tick' : 'blank'}
										text={item.label}
										onClick={() => {
											dispatch(actionColorModeChanged(item.id));
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
								alignText="left"
								id="TBEX_COLORS"
								key="TBEX_COLORS"
								icon="style"
								rightIcon="caret-down"
								text="MODE"
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
								alignText="left"
								id="TBEX_IMPORT"
								key="TBEX_IMPORT"
								icon="database"
								rightIcon="caret-down"
								text="QUICK LOAD DEMO IMAGE"
							/>
						)}
					/>
				</ButtonGroup>
			</Navbar.Group>
		</>
	) : null;
};

export default Extras;
