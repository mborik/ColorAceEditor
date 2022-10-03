/*
 * PMD 85 ColorAce picture editor
 * DrawMode component
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import React, { useCallback } from 'react';
import { Button, ButtonGroup, Navbar, Tooltip, Position, KeyCombo } from "@blueprintjs/core";

import constants from '../params/constants';
import { EditorTool, EditorDrawMode } from '../editor/Editor';
import { actionDrawModeChanged } from '../actions/base';
import { DrawModeItems } from '../params/DrawMode';
import { useEditor } from './EditorProvider';


const DrawMode: React.VFC = () => {
	const { dispatch, editor } = useEditor()
	const dispatchChange = useCallback(
		(editMode: EditorDrawMode) => dispatch(actionDrawModeChanged(editMode)),
		[ dispatch ]
	);

	const noSelection = (
		editor?.editTool !== EditorTool.Selection &&
		editor?.editTool !== EditorTool.AttrSelect
	);

	return noSelection ? (
		<Navbar.Group align="left">
			<ButtonGroup>
				{DrawModeItems.map(mode => {
					const isActive = (mode.id === editor?.editMode)

					return (
						<Tooltip
							key={`${mode.id}_TT`}
							position={Position.BOTTOM_RIGHT}
							hoverOpenDelay={constants.TOOLTIP_TIMEOUT}
							content={<>
								<label>{mode.title}</label>
								<KeyCombo combo={mode.hotkey} />
							</>}>

							<Button
								id={mode.id}
								key={mode.id}
								text={mode.caption}
								active={isActive}
								intent={isActive ? 'primary' : 'none'}
								onClick={() => dispatchChange(mode.id)}
							/>
						</Tooltip>
					)}
				)}
			</ButtonGroup>
		</Navbar.Group>
	) : null;
}

export default DrawMode;
