/*
 * PMD 85 ColorAce picture editor
 * Toolbar component
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import * as React from "react";
import { Button, ButtonGroup, Navbar, Tooltip, Position, KeyCombo } from "@blueprintjs/core";

import constants from '../params/constants';
import { EditorTool } from '../editor/Editor';
import { actionToolChanged } from '../actions/base';
import { ToolbarItems } from '../params/Toolbar';
import { useEditor } from './EditorProvider';


const Toolbar: React.VFC = () => {
	const { dispatch, editor } = useEditor()
	const dispatchChange = React.useCallback(
		(editTool: EditorTool) => dispatch(actionToolChanged(editTool)),
		[ dispatch ]
	);

	return editor ? (
		<Navbar.Group align="center">
			<ButtonGroup fill={true}>
				{ToolbarItems.map(toolBarItem => {
					const tool: any = {
						...toolBarItem,
						active: (toolBarItem.id === editor.editTool)
					};

					if (tool.active) {
						tool.intent = 'primary';
					} else if (tool.id === EditorTool.Pencil && editor.editTool === EditorTool.Recorder) {
						tool.active = true;
						tool.intent = 'warning';
					}

					return (
						<Tooltip
							key={`${tool.id}_TT`}
							content={<>
								<label>{tool.title}</label>
								<KeyCombo combo={tool.hotkey} />
							</>}
							position={Position.TOP_RIGHT}
							hoverOpenDelay={constants.TOOLTIP_TIMEOUT}>

							<Button
								id={tool.id}
								key={tool.id}
								icon={tool.icon}
								active={tool.active}
								intent={tool.intent}
								onClick={() => dispatchChange(tool.id)}
							/>
						</Tooltip>
					)
				})}
			</ButtonGroup>
		</Navbar.Group>
	) : null;
}

export default Toolbar;
