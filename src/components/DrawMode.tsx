/*
 * PMD 85 ColorAce picture editor
 * DrawMode component
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import * as React from 'react';
import { Button, ButtonGroup, Navbar, Position, KeyCombo } from "@blueprintjs/core";
import { Tooltip2 } from '@blueprintjs/popover2';

import constants from '../params/constants';
import { OVERLAY_WRAPPER } from '../params/querySelectors';
import { DrawModeItems } from '../params/DrawMode';
import { actionDrawModeChanged } from '../actions/base';
import { EditorTool } from '../editor/Editor';
import { useEditor } from './EditorProvider';


const DrawMode: React.VFC = () => {
	const { dispatch, editor } = useEditor();
	const portalContainer = OVERLAY_WRAPPER();

	const noSelection = (
		editor?.editTool !== EditorTool.Selection &&
		editor?.editTool !== EditorTool.AttrSelect
	);

	return noSelection ? (
		<Navbar.Group align="left">
			<ButtonGroup>
				{DrawModeItems.map(mode => {
					const isActive = (mode.id === editor?.editMode);

					return (
						<Tooltip2
							key={`${mode.id}_TT`}
							position={Position.BOTTOM_RIGHT}
							hoverOpenDelay={constants.TOOLTIP_TIMEOUT}
							portalContainer={portalContainer}
							content={<>
								<label>{mode.title}</label>
								<KeyCombo combo={mode.hotkey} />
							</>}
							renderTarget={({ isOpen, ref: elementRef, ...targetProps }) => (
								<Button
									{...targetProps}
									id={mode.id}
									key={mode.id}
									text={mode.caption}
									active={isActive}
									intent={isActive ? 'primary' : 'none'}
									elementRef={elementRef}
									onClick={() => {
										!isActive && dispatch(actionDrawModeChanged(mode.id));
									}}
								/>
							)}
						/>
					)}
				)}
			</ButtonGroup>
		</Navbar.Group>
	) : null;
}

export default DrawMode;
