/*
 * PMD 85 ColorAce picture editor
 * SelectTools component
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import * as React from "react";
import { Button, ButtonGroup, Navbar, Tooltip, Position, Popover, Menu, MenuItem, MenuDivider, Icon, KeyCombo } from "@blueprintjs/core";

import constants from '../params/constants';
import { EditorTool } from '../editor/Editor';
import { SelectToolItemAction, SelectToolItems, SelectToolSubMenu } from '../params/SelectTool';
import { actionSelectFnCheckboxChanged } from '../actions/base';
import { useEditor } from "./EditorProvider";


const SelectTools: React.VFC = () => {
	const { dispatch, editor } = useEditor();
	const dispatchChange = React.useCallback((actionHandler: SelectToolItemAction) => {
		if (!editor || !actionHandler) {
			return
		}
		dispatch(actionHandler(editor))
	},
	[ dispatch, editor ]);

	const dispatchCheckboxChange = React.useCallback((checkboxProperty: string) =>
		dispatch(actionSelectFnCheckboxChanged(checkboxProperty)),
		[ dispatch ]
	);

	if (!editor) {
		return null;
	}

	const selection =
		editor.editTool === EditorTool.Selection ||
		editor.editTool === EditorTool.AttrSelect;

	const	menu = editor.selection.nonEmpty() ? SelectToolSubMenu.map(
		(item: any, idx: number) => {
			if (item.divider) {
				return { ...item, key: `TBSD_${idx}` };

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
				return {
					key: item.id,
					id: item.id,
					icon: item.icon,
					text: item.text,
					labelElement: item.hotkey ? <KeyCombo combo={item.hotkey} /> : undefined,
					onClick: () => dispatchChange(item.action)
				};
			}
		}
	) : [];

	return selection ? (
		<Navbar.Group align="center">
			<ButtonGroup fill={true}>
				{SelectToolItems.map(tool => {
					const enabled = tool.enabled || editor.selection.nonEmpty()
					return (
						<Tooltip
							key={`${tool.id}_TT`}
							content={enabled ? (
								<>
									<label>{tool.title}</label>
									<KeyCombo combo={tool.hotkey} />
								</>
							) : undefined}
							disabled={!enabled}
							position={Position.BOTTOM_RIGHT}
							hoverOpenDelay={constants.TOOLTIP_TIMEOUT}>

							<Button
								id={tool.id}
								key={tool.id}
								icon={tool.icon}
								disabled={!enabled}
								active={false}
								onClick={() => dispatchChange(tool.action)}
							/>
						</Tooltip>
					)
				})}
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
