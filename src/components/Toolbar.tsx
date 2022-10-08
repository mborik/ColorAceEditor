/*
 * PMD 85 ColorAce picture editor
 * Toolbar component
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import * as React from 'react';
import { Button, ButtonGroup, Navbar, Position, KeyCombo } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';

import constants from '../params/constants';
import { OVERLAY_WRAPPER } from '../elements';
import { ToolbarItems } from '../params/Toolbar';
import { actionToolChanged } from '../actions/base';
import { EditorTool } from '../editor/Editor';
import { useEditor } from './EditorProvider';


const Toolbar: React.VFC = () => {
	const { dispatch, editor } = useEditor();
	const portalContainer = OVERLAY_WRAPPER();

	return editor ? (
		<Navbar.Group align="center">
			<ButtonGroup fill={true}>
				{ToolbarItems.map((tool) => {
					const isActive = (tool.id === editor.editTool);
					const isRecorder = (
						tool.id === EditorTool.Pencil &&
						editor.editTool === EditorTool.Recorder
					);

					return (
						<Tooltip2
							key={`${tool.id}_TT`}
							position={Position.TOP_RIGHT}
							hoverOpenDelay={constants.TOOLTIP_TIMEOUT}
							portalContainer={portalContainer}
							content={<>
								<label>{tool.title}</label>
								<KeyCombo combo={tool.hotkey} />
							</>}
							renderTarget={({ isOpen: _, ref: elementRef, ...targetProps }) => (
								<Button
									{...targetProps}
									id={tool.id}
									key={tool.id}
									icon={tool.icon}
									active={isActive || isRecorder}
									intent={isRecorder ? 'warning' : isActive ? 'primary' : 'none'}
									elementRef={elementRef}
									onClick={() => {
										!isActive && dispatch(actionToolChanged(tool.id));
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

export default Toolbar;
