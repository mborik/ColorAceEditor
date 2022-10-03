/*
 * PMD 85 ColorAce picture editor
 * Palette component
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import React, { useCallback } from 'react';
import { Button, ButtonGroup, Navbar, Tooltip, Position, Icon, KeyCombo, IconSize } from "@blueprintjs/core";

import constants from '../params/constants';
import { actionColorChanged } from '../actions/base';
import { PaletteItems } from '../params/Palette';
import { useEditor } from './EditorProvider';
import { IconCodepoints } from '@blueprintjs/icons';


const Palette: React.VFC = () => {
	const { dispatch, editor } = useEditor();
	const dispatchChange = useCallback(
		(editColor: number) => dispatch(actionColorChanged(editColor)),
		[ dispatch ]
	);

	return editor ? (
		<Navbar.Group align="center">
			<ButtonGroup fill={true}>
				{PaletteItems.map((tool) => {
					const { attrs, value } = tool;
					const isActive = (value === editor.editColor);

					return (
						<Tooltip
							key={`${tool.id}_TT`}
							position={Position.BOTTOM_RIGHT}
							hoverOpenDelay={constants.TOOLTIP_TIMEOUT}
							content={attrs?.length ? (
								<>
									<code>
										attr0: <b>{attrs[0]}</b><br/>
										attr1: <b>{attrs[1]}</b>
									</code>
									<KeyCombo combo={value.toString()} />
								</>
							) : (
								<>
									<span>
										no color change<br />
										<i>(attrs not modified)</i>
									</span>
									<KeyCombo combo="D" />
								</>
							)}>

							<Button
								id={tool.id}
								key={tool.id}
								icon={<Icon
									icon={tool.icon ?? 'symbol-square'}
									iconSize={tool.icon ? IconSize.STANDARD : 24}
									color={tool.color ?? '#ffffff7f'}
								/>}
								active={isActive}
								intent={isActive ? 'primary' : undefined}
								onClick={() => dispatchChange(value)}
							/>
						</Tooltip>
					)
				})}
			</ButtonGroup>
		</Navbar.Group>
	) : null;
}

export default Palette;
