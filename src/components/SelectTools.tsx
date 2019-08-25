/*
 * PMD 85 ColorAce picture editor
 * Selection component
 *
 * Copyright (c) 2019 Martin Bórik
 */

import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, ButtonGroup, Navbar, Tooltip, Position, Popover, Menu, MenuItem, MenuDivider, Icon } from "@blueprintjs/core";

import constants from '../params/constants';
import { Editor, EditorTool } from '../editor/Editor';
import { SelectToolItems, SelectToolSubMenu } from '../params/SelectTool';


const SelectTools: React.FunctionComponent = () => {
	const dispatch = useDispatch();

	const { selection, tools, menu } = useSelector((state: any) => {
		const editor: Editor = state.editor;

		if (editor == null) {
			return {
				selection: false,
				tools: [],
				menu: []
			};
		}

		return {
			selection: (
				editor.editTool === EditorTool.Selection ||
				editor.editTool === EditorTool.GridSelect
			),
			tools: SelectToolItems.map(tool => ({
				...tool,
				active: false,
				enabled: tool.enabled || editor.selection.nonEmpty()
			})),
			menu: editor.selection.nonEmpty() ? SelectToolSubMenu.map((item: any) => item.divider ? item :
				item.checkbox ? {
					id: item.id,
					icon: item.icon,
					text: item.text,
					shouldDismissPopover: false,
					labelElement: <Icon icon={editor[item.checkboxProperty] ? 'tick' : 'blank'} />,
					onClick: () => dispatch(() => {
						editor[item.checkboxProperty] = !editor[item.checkboxProperty];
					})
				} : { ...item }
			) : []
		};
	});

	const dispatchChange = useCallback(
		(id) => dispatch(() => {}),
		[ dispatch ]
	);

	return selection ? (
		<Navbar.Group align="center">
			<ButtonGroup fill={true}>
				{tools.map(t => (
					<Tooltip
						key={`${t.id}_TT`}
						content={t.title}
						disabled={!t.enabled}
						position={Position.BOTTOM_RIGHT}
						hoverOpenDelay={constants.TOOLTIP_TIMEOUT}>

						<Button
							id={t.id}
							key={t.id}
							icon={t.icon}
							disabled={!t.enabled}
							active={t.active}
							intent={t.active ? 'primary' : undefined}
							onClick={() => dispatchChange(t.id)}
						/>
					</Tooltip>
				))}
				<Popover
					disabled={menu.length === 0}
					position={Position.BOTTOM_LEFT}
					content={<Menu>
						{menu.map(item =>
							item.divider ? <MenuDivider /> : <MenuItem {...item} />
						)}
					</Menu>}>
					<Button
						disabled={menu.length === 0}
						text="MORE" rightIcon="caret-down"
					/>
				</Popover>
			</ButtonGroup>
		</Navbar.Group>
	) : null;
}

export default SelectTools;
