/*
 * PMD 85 ColorAce picture editor
 * FileMenu component
 *
 * Copyright (c) 2019 Martin Bórik
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Navbar, Tooltip, KeyCombo, Position } from "@blueprintjs/core";
import { actionToggleGuides } from '../actions/editor';
import constants from '../params/constants';
import { EditorReducerState } from '../reducers/editor';

const Extras: React.FunctionComponent = () => {
	const guidelines = useSelector((state: EditorReducerState) => {
		const editor = state.editor;
		return editor && editor.showGuides;
	});

	const dispatch = useDispatch();
	const handleToggleGuides = useCallback(
		() => dispatch(actionToggleGuides()
	), [ dispatch ]);

	return <>
		<Navbar.Group align="left">
			<Button
				key="TBEX_IMPORT"
				icon="database"
				rightIcon="caret-down"
				text="IMPORT.DB"
				onClick={() => {}}
			/>
		</Navbar.Group>
		<Navbar.Group align="right">
			<Tooltip
				content={<>
					<label>toggle guidelines</label>
					<KeyCombo combo="cmd+G" />
				</>}
				position={Position.BOTTOM_RIGHT}
				hoverOpenDelay={constants.TOOLTIP_TIMEOUT}>

				<Button
					key="TBEX_GUIDES"
					icon="grid"
					active={guidelines}
					intent={guidelines ? 'primary' : undefined}
					onClick={handleToggleGuides}
				/>
			</Tooltip>
		</Navbar.Group>
	</>;
}

export default Extras;
