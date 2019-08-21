/*
 * PMD 85 ColorAce picture editor
 * Toolbar component
 *
 * Copyright (c) 2019 Martin Bórik
 */

import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, ButtonGroup, Navbar, Tooltip, Position } from "@blueprintjs/core";

import { Editor } from '../editor/Editor';
import { toolChanged } from '../actions/editor';
import { ToolbarItems } from '../params/Toolbar';


const Toolbar: React.FunctionComponent = () => {
	const tools = useSelector((state: any) => {
		const editor: Editor = state.editor;

		if (editor) {
			return ToolbarItems.map((tool, i) => ({
				...tool,
				active: (i === editor.editTool)
			}));
		}

		return ToolbarItems;
	});

	const dispatch = useDispatch();
	const dispatchChange = useCallback(
		(editTool: number) => dispatch(toolChanged(editTool)),
		[ dispatch ]
	);

	return (
		<Navbar.Group align="center">
			<ButtonGroup fill={true}>
				{tools.map((t, i) => (
					<Tooltip
						key={`${t.id}tip`}
						content={t.title}
						position={Position.TOP_RIGHT}
						hoverOpenDelay={250}>

						<Button
							id={t.id}
							icon={t.icon}
							active={t.active}
							intent={t.active ? 'primary' : undefined}
							onClick={() => dispatchChange(i)}
						/>
					</Tooltip>
				))}
			</ButtonGroup>
		</Navbar.Group>
	);
}

export default Toolbar;
