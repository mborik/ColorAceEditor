/*
 * PMD 85 ColorAce picture editor
 * FillShape component
 *
 * Copyright (c) 2019 Martin Bórik
 */

import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Navbar, Tooltip, Position } from "@blueprintjs/core";
import { IconName } from '@blueprintjs/icons';

import constants from '../params/constants';
import { Editor, EditorTool } from '../editor/Editor';
import { fillShapeChanged } from '../actions/editor';


const FillShape: React.FunctionComponent = () => {
	const { status, visible } = useSelector((state: any) => {
		const editor: Editor = state.editor;

		let visible: boolean = false;
		let status: any = {
			id: EditorTool.FillShape,
			key: EditorTool.FillShape,
			icon: 'tint' as IconName
		};

		if (editor != null) {
			status.active = editor.editFilled;
			visible = (
				editor.editTool !== EditorTool.Selection &&
				editor.editTool !== EditorTool.GridSelect
			) && (
				editor.editTool === EditorTool.Ellipse ||
				editor.editTool === EditorTool.Rectangle
			);
		}

		return {
			status,
			visible
		};
	});

	const dispatch = useDispatch();
	const dispatchChange = useCallback(
		(editFilled: boolean) => dispatch(fillShapeChanged(editFilled)),
		[ dispatch ]
	);

	return visible ? (
		<Navbar.Group align="right">
			<Tooltip
				key={`${status.key}_TT`}
				content="filled shape"
				position={Position.BOTTOM_RIGHT}
				hoverOpenDelay={constants.TOOLTIP_TIMEOUT}>

				<Button
					{...status}
					intent={status.active ? 'primary' : undefined}
					onClick={() => dispatchChange(!status.active)}
				/>
			</Tooltip>
		</Navbar.Group>
	) : null;
}

export default FillShape;
