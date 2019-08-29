/*
 * PMD 85 ColorAce picture editor
 * Toolbar component
 *
 * Copyright (c) 2019 Martin Bórik
 */

import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, ButtonGroup, Navbar, Tooltip, Position, KeyCombo } from "@blueprintjs/core";

import constants from '../params/constants';
import { Editor, EditorTool } from '../editor/Editor';
import { actionToolChanged } from '../actions/editor';
import { ToolbarItems } from '../params/Toolbar';


const Toolbar: React.FunctionComponent = () => {
	const tools = useSelector((state: any) => {
		const editor: Editor = state.editor;

		if (editor) {
			return ToolbarItems.map((tool: any) => ({
				...tool,
				active: (tool.id === editor.editTool),
				content: <>
					<label>{tool.title}</label>
					<KeyCombo combo={tool.hotkey} />
				</>
			}));
		}

		return ToolbarItems;
	});

	const dispatch = useDispatch();
	const dispatchChange = useCallback(
		(editTool: EditorTool) => dispatch(actionToolChanged(editTool)),
		[ dispatch ]
	);

	return (
		<Navbar.Group align="center">
			<ButtonGroup fill={true}>
				{tools.map(t => (
					<Tooltip
						key={`${t.id}_TT`}
						content={t.content}
						position={Position.TOP_RIGHT}
						hoverOpenDelay={constants.TOOLTIP_TIMEOUT}>

						<Button
							id={t.id}
							key={t.id}
							icon={t.icon}
							active={t.active}
							intent={t.active ? 'primary' : undefined}
							onClick={() => dispatchChange(t.id)}
						/>
					</Tooltip>
				))}
			</ButtonGroup>
		</Navbar.Group>
	);
}

export default Toolbar;
