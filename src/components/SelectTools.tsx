/*
 * PMD 85 ColorAce picture editor
 * SelectTools component
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import * as React from "react";
import debounce from "lodash/debounce";
import { Button, ButtonGroup, Navbar, Tooltip, Position, Popover, Menu, MenuItem, MenuDivider, Icon, KeyCombo } from "@blueprintjs/core";

import constants from '../params/constants';
import { EditorTool } from '../editor/Editor';
import { SelectToolItemAction, SelectToolItems, SelectToolSubMenu } from '../params/SelectTool';
import { actionSelectFnCheckboxChanged } from '../actions/base';
import { useEditor } from "./EditorProvider";


const SelectTools: React.VFC = () => {
	const { dispatch, editor } = useEditor();
	const [isSelectionNonEmpty, setIsSelectionNonEmpty] = React.useState(false);

	const debouncedObservedSelection = debounce(
		(selection) => setIsSelectionNonEmpty(selection.nonEmpty()),
		constants.DEBOUNCE_TIMEOUT
	);

	React.useEffect(() => {
		if (!editor) {
			return;
		}
		editor.selection = new Proxy(editor.selection, {
			set(...args) {
				debouncedObservedSelection(args[0]);
				return Reflect.set(...args);
			}
		})
	},
	[ editor ])

	const dispatchChange = React.useCallback((actionHandler: SelectToolItemAction) => {
		if (!editor || !actionHandler) {
			return
		}
		dispatch(actionHandler(editor))
	},
	[ dispatch, editor ]);

	const dispatchCheckboxChange = React.useCallback((checkboxProperty: string) =>
		dispatch(actionSelectFnCheckboxChanged(checkboxProperty)),
	[ dispatch ]);

	if (!editor) {
		return null;
	}

	const isSelectionMode =
		editor.editTool === EditorTool.Selection ||
		editor.editTool === EditorTool.AttrSelect;

	const	menu = isSelectionNonEmpty ? SelectToolSubMenu.map(
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

	return isSelectionMode ? (
		<Navbar.Group align="center">
			<ButtonGroup fill={true}>
				{SelectToolItems.map((tool) => {
					const isEnabled = (tool.enabled || isSelectionNonEmpty)

					return (
						<Tooltip
							key={`${tool.id}_TT`}
							disabled={!isEnabled}
							position={Position.BOTTOM_RIGHT}
							hoverOpenDelay={constants.TOOLTIP_TIMEOUT}
							content={isEnabled ? (
								<>
									<label>{tool.title}</label>
									<KeyCombo combo={tool.hotkey} />
								</>
							) : undefined}>

							<Button
								id={tool.id}
								key={tool.id}
								icon={tool.icon}
								disabled={!isEnabled}
								active={false}
								onClick={() => tool.action && dispatchChange(tool.action)}
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
