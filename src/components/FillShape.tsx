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
	const btn = useSelector((state: any) => {
		const editor: Editor = state.editor;
		let status: any = {};

		if (editor != null) {
			status.active = editor.editFilled;
			status.visible = (
				editor.editTool !== EditorTool.Selection &&
				editor.editTool !== EditorTool.GridSelect
			) && (
				editor.editTool === EditorTool.Ellipse ||
				editor.editTool === EditorTool.Rectangle
			);
		}

		return {
			id: EditorTool.FillShape,
			key: EditorTool.FillShape,
			icon: 'tint' as IconName,
			...status
		}
	});

	const dispatch = useDispatch();
	const dispatchChange = useCallback(
		(editFilled: boolean) => dispatch(fillShapeChanged(editFilled)),
		[ dispatch ]
	);

	return btn.visible ? (
		<Navbar.Group align="right">
			<Tooltip
				key={`${btn.key}_TT`}
				content="filled shape"
				position={Position.BOTTOM_RIGHT}
				hoverOpenDelay={constants.TOOLTIP_TIMEOUT}>

				<Button
					{...btn}
					intent={btn.active ? 'primary' : undefined}
					onClick={() => dispatchChange(!btn.active)}
				/>
			</Tooltip>
		</Navbar.Group>
	) : null;
}

export default FillShape;
