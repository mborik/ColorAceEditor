/*
 * PMD 85 ColorAce picture editor
 * FillShape component
 *
 * Copyright (c) 2019 Martin Bórik
 */

import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Navbar, Tooltip, Position, KeyCombo } from "@blueprintjs/core";

import constants from '../params/constants';
import { Editor, EditorTool } from '../editor/Editor';
import { actionFillShapeChanged } from '../actions/base';


const FillShape: React.FunctionComponent = () => {
	const { active, visible } = useSelector((state: any) => {
		const editor: Editor = state.editor;

		let active: boolean = false;
		let visible: boolean = false;

		if (editor != null) {
			active = editor.editFilled;
			visible = (
				editor.editTool === EditorTool.Ellipse ||
				editor.editTool === EditorTool.Rectangle
			);
		}

		return { active, visible };
	});

	const dispatch = useDispatch();
	const dispatchChange = useCallback(
		(editFilled: boolean) => dispatch(actionFillShapeChanged(editFilled)),
		[ dispatch ]
	);

	return visible ? (
		<Navbar.Group align="right">
			<Tooltip
				content={<>
					<label>filled shape</label>
					<KeyCombo combo="V" />
				</>}
				position={Position.BOTTOM_RIGHT}
				hoverOpenDelay={constants.TOOLTIP_TIMEOUT}>

				<Button
					id={EditorTool.FillShape}
					key={EditorTool.FillShape}
					icon='contrast'
					active={active}
					intent={active ? 'primary' : undefined}
					onClick={() => dispatchChange(!active)}
				/>
			</Tooltip>
		</Navbar.Group>
	) : null;
}

export default FillShape;
