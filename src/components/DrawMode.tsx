/*
 * PMD 85 ColorAce picture editor
 * DrawMode component
 *
 * Copyright (c) 2019 Martin Bórik
 */

import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, ButtonGroup, Navbar, Tooltip, Position } from "@blueprintjs/core";

import constants from '../params/constants';
import { Editor, EditorTool, EditorDrawMode } from '../editor/Editor';
import { drawModeChanged } from '../actions/editor';
import { DrawModeItems } from '../params/DrawMode';


const DrawMode: React.FunctionComponent = () => {
	const { modes, noSelection } = useSelector((state: any) => {
		const editor: Editor = state.editor;

		if (editor == null) {
			return {
				tools: DrawModeItems,
				noSelection: false
			};
		}

		return {
			noSelection: (
				editor.editTool !== EditorTool.Selection &&
				editor.editTool !== EditorTool.GridSelect
			),
			modes: DrawModeItems.map(mode => ({
				...mode,
				active: (mode.id === editor.editMode)
			}))
		};
	});

	const dispatch = useDispatch();
	const dispatchChange = useCallback(
		(editMode: EditorDrawMode) => dispatch(drawModeChanged(editMode)),
		[ dispatch ]
	);

	return noSelection ? (
		<Navbar.Group align="left">
			<ButtonGroup>
				{modes.map(m => (
					<Tooltip
						key={`${m.id}_TT`}
						content={m.title}
						position={Position.BOTTOM_RIGHT}
						hoverOpenDelay={constants.TOOLTIP_TIMEOUT}>

						<Button
							id={m.id}
							key={m.id}
							text={m.caption}
							active={m.active}
							intent={m.active ? 'primary' : undefined}
							onClick={() => dispatchChange(m.id)}
						/>
					</Tooltip>
				))}
			</ButtonGroup>
		</Navbar.Group>
	) : null;
}

export default DrawMode;
