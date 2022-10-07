/*
 * PMD 85 ColorAce picture editor
 * Palette component
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import * as React from 'react';
import { Button, ButtonGroup, Navbar, Position, Icon, KeyCombo, IconSize } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';

import constants from '../params/constants';
import { OVERLAY_WRAPPER } from '../params/querySelectors';
import { PaletteItems } from '../params/Palette';
import { actionColorChanged } from '../actions/base';
import { useEditor } from './EditorProvider';


const Palette: React.VFC = () => {
	const { dispatch, editor } = useEditor();
	const portalContainer = OVERLAY_WRAPPER();

	return editor ? (
		<Navbar.Group align="center">
			<ButtonGroup fill={true}>
				{PaletteItems.map((tool) => {
					const { attrs, value } = tool;
					const isActive = (value === editor.editColor);

					return (
						<Tooltip2
							key={`${tool.id}_TT`}
							position={Position.BOTTOM_RIGHT}
							hoverOpenDelay={constants.TOOLTIP_TIMEOUT}
							portalContainer={portalContainer}
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
							)}
							renderTarget={({ isOpen: _, ref: elementRef, ...targetProps }) => (
								<Button
									{...targetProps}
									elementRef={elementRef}
									id={tool.id}
									key={tool.id}
									icon={<Icon
										icon={tool.icon ?? 'symbol-square'}
										iconSize={tool.icon ? IconSize.STANDARD : 24}
										color={tool.color ?? '#ffffff7f'}
									/>}
									active={isActive}
									intent={isActive ? 'primary' : 'none'}
									onClick={() => {
										!isActive && dispatch(actionColorChanged(value));
									}}
								/>
							)}
						/>
					);
				})}
			</ButtonGroup>
		</Navbar.Group>
	) : null;
};

export default Palette;
