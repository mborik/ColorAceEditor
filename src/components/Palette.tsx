/*
 * PMD 85 ColorAce picture editor
 * Palette component
 *
 * Copyright (c) 2019 Martin Bórik
 */

import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, ButtonGroup, Navbar, Tooltip, Position, Icon } from "@blueprintjs/core";

import constants from '../params/constants';
import { Editor } from '../editor/Editor';
import { actionColorChanged } from '../actions/editor';
import { PaletteItems } from '../params/Palette';


const Palette: React.FunctionComponent = () => {
	const palette = useSelector((state: any) => {
		const editor: Editor = state.editor;

		if (editor) {
			return PaletteItems.map((item: any) => ({
				...item,
				icon: item.icon || 'symbol-square',
				iconSize: item.icon ? Icon.SIZE_STANDARD : 24,
				color: item.color || '#ffffff7f',
				active: (item.value === editor.editColor),
				content: item.attrs && item.attrs.length ? <code>
					attr0: <b>{item.attrs[0]}</b><br/>
					attr1: <b>{item.attrs[1]}</b>
				</code> : <>
					no color change<br />
					<i>(attrs not modified)</i>
				</>
			}));
		}

		return PaletteItems;
	});

	const dispatch = useDispatch();
	const dispatchChange = useCallback(
		(editColor: number) => dispatch(actionColorChanged(editColor)),
		[ dispatch ]
	);

	return (
		<Navbar.Group align="center">
			<ButtonGroup fill={true}>
				{palette.map(t => (
					<Tooltip
						key={`${t.id}_TT`}
						content={t.content}
						position={Position.BOTTOM_RIGHT}
						hoverOpenDelay={constants.TOOLTIP_TIMEOUT}>

						<Button
							id={t.id}
							key={t.id}
							icon={<Icon icon={t.icon} iconSize={t.iconSize} color={t.color} />}
							active={t.active}
							intent={t.active ? 'primary' : undefined}
							onClick={() => dispatchChange(t.value)}
						/>
					</Tooltip>
				))}
			</ButtonGroup>
		</Navbar.Group>
	);
}

export default Palette;
