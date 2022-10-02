/*
 * PMD 85 ColorAce picture editor
 * FillShape component
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import React, { useCallback } from 'react';
import { Button, Navbar, Tooltip, Position, KeyCombo } from "@blueprintjs/core";

import constants from '../params/constants';
import { EditorTool } from '../editor/Editor';
import { actionFillShapeChanged } from '../actions/base';
import { useEditor } from './EditorProvider';


const FillShape: React.VFC = () => {
	const { dispatch, editor } = useEditor();
	const dispatchChange = useCallback(
		(editFilled: boolean) => dispatch(actionFillShapeChanged(editFilled)),
		[ dispatch ]
	);

	const active: boolean = editor?.editFilled === true;
	const visible: boolean = (
		editor?.editTool === EditorTool.Ellipse ||
		editor?.editTool === EditorTool.Rectangle
	);

	return visible ? (
		<Navbar.Group align="right">
			<Tooltip
				position={Position.BOTTOM_RIGHT}
				hoverOpenDelay={constants.TOOLTIP_TIMEOUT}>
				content={<>
					<label>filled shape</label>
					<KeyCombo combo="V" />
				</>}

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
