/*
 * PMD 85 ColorAce picture editor
 * SelectTools component
 *
 * Copyright (c) 2019 Martin Bórik
 */

import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, ButtonGroup, Navbar, Tooltip, Position, Popover, Menu, MenuItem, MenuDivider, Icon } from "@blueprintjs/core";

import constants from '../params/constants';
import { Editor, EditorTool } from '../editor/Editor';
import { SelectToolItems, SelectToolSubMenu } from '../params/SelectTool';
import { actionSelectFnCheckboxChanged } from '../actions/editor';


const SelectTools: React.FunctionComponent = () => {
	const dispatch = useDispatch();
	const dispatchCheckboxChange = useCallback((checkboxProperty: string) =>
		dispatch(actionSelectFnCheckboxChanged(checkboxProperty)),
		[ dispatch ]
	);

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
			menu: editor.selection.nonEmpty() ? SelectToolSubMenu.map(
				(item: any, idx: number) => {
					if (item.divider) {
						return { key: `TBSD_${idx}`, ...item };

					} else if (item.checkbox) {
						const checked = editor[item.checkboxProperty];
						return {
							key: item.id,
							id: item.id,
							icon: item.icon,
							text: (checked && item.checkedText) ? item.checkedText : item.text,
							shouldDismissPopover: false,
							labelElement: <Icon icon={checked ? 'tick' : 'blank'} />,
							onClick: () => dispatchCheckboxChange(item.checkboxProperty)
						};
					}
					else {
						return { key: item.id, ...item };
					}
				}
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
							item.divider ?
								<MenuDivider {...item} /> :
								<MenuItem {...item} />
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
