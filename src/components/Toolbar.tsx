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
import { actionToolChanged } from '../actions/base';
import { ToolbarItems } from '../params/Toolbar';


const Toolbar: React.FunctionComponent = () => {
	const tools = useSelector((state: any) => {
		const editor: Editor = state.editor;

		if (editor) {
			return ToolbarItems.map(tool => {
				const result: any = {
					active: (tool.id === editor.editTool)
				};

				if (result.active) {
					result.intent = 'primary';

				} else if (tool.id === EditorTool.Pencil && editor.editTool === EditorTool.Recorder) {
					result.active = true;
					result.intent = 'warning';
				}

				return {
					...tool,
					...result,
					content: <>
						<label>{tool.title}</label>
						<KeyCombo combo={tool.hotkey} />
					</>
				};
			});
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
							intent={t.intent}
							onClick={() => dispatchChange(t.id)}
						/>
					</Tooltip>
				))}
			</ButtonGroup>
		</Navbar.Group>
	);
}

export default Toolbar;
