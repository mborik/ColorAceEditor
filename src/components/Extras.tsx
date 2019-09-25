/*
 * PMD 85 ColorAce picture editor
 * FileMenu component
 *
 * Copyright (c) 2019 Martin Bórik
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Navbar, Tooltip, KeyCombo, Position, ButtonGroup } from "@blueprintjs/core";
import { actionUndo, actionToggleGuides } from '../actions/editor';
import constants from '../params/constants';
import { EditorReducerState } from '../reducers/editor';

const Extras: React.FunctionComponent = () => {
	const dispatch = useDispatch();
	const guidelines = useSelector((state: EditorReducerState) => {
		const editor = state.editor;
		return editor && editor.showGuides;
	});

	const handleUndo = useCallback(
		() => dispatch(actionUndo()
	), [ dispatch ]);

	const handleToggleGuides = useCallback(
		() => dispatch(actionToggleGuides()
	), [ dispatch ]);

	return <>
		<Navbar.Group align="center">
			<ButtonGroup fill={true}>
				<Button
					id="TBEX_IMPORT"
					key="TBEX_IMPORT"
					icon="database"
					rightIcon="caret-down"
					text="IMPORT"
					onClick={() => {}}
				/>
				<Tooltip
					key="TBEX_UNDO_TT"
					content={<>
						<label>undo</label>
						<KeyCombo combo="cmd+Z" />
					</>}
					position={Position.BOTTOM_RIGHT}
					hoverOpenDelay={constants.TOOLTIP_TIMEOUT}>

					<Button
						id="TBEX_UNDO"
						key="TBEX_UNDO"
						icon="undo"
						text="UNDO"
						onClick={handleUndo}
					/>
				</Tooltip>
				<Tooltip
					key="TBEX_GUIDES_TT"
					content={<>
						<label>toggle guidelines</label>
						<KeyCombo combo="cmd+G" />
					</>}
					position={Position.BOTTOM_RIGHT}
					hoverOpenDelay={constants.TOOLTIP_TIMEOUT}>

					<Button
						id="TBEX_GUIDES"
						key="TBEX_GUIDES"
						icon="grid"
						active={guidelines}
						intent={guidelines ? 'primary' : undefined}
						onClick={handleToggleGuides}
					/>
				</Tooltip>
			</ButtonGroup>
		</Navbar.Group>
	</>;
}

export default Extras;
