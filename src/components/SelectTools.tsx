/*
 * PMD 85 ColorAce picture editor
 * SelectTools component
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import * as React from "react";
import debounce from "lodash/debounce";
import { Button, ButtonGroup, Navbar, Position, Menu, MenuItem, MenuDivider, Icon, KeyCombo } from "@blueprintjs/core";
import { Popover2, Tooltip2 } from "@blueprintjs/popover2";

import constants from '../params/constants';
import { OVERLAY_WRAPPER } from "../params/querySelectors";
import { SelectToolItems, SelectToolSubMenu } from '../params/SelectTool';
import { actionSelectFnCheckboxChanged } from '../actions/base';
import { EditorTool } from '../editor/Editor';
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

	if (!editor) {
		return null;
	}

	const portalContainer = OVERLAY_WRAPPER();
	const isSelectionMode =
		editor.editTool === EditorTool.Selection ||
		editor.editTool === EditorTool.AttrSelect;

	return isSelectionMode ? (
		<Navbar.Group align="center">
			<ButtonGroup fill={true}>
				{SelectToolItems.map((tool) => {
					const isEnabled = (tool.enabled || isSelectionNonEmpty)

					return (
						<Tooltip2
							key={`${tool.id}_TT`}
							disabled={!isEnabled}
							position={Position.BOTTOM_RIGHT}
							hoverOpenDelay={constants.TOOLTIP_TIMEOUT}
							portalContainer={portalContainer}
							content={<>
								<label>{tool.title}</label>
								<KeyCombo combo={tool.hotkey} />
							</>}>

							<Button
								id={tool.id}
								key={tool.id}
								icon={tool.icon}
								disabled={!isEnabled}
								active={false}
								onClick={() => {
									tool.action && dispatch(tool.action(editor));
								}}
							/>
						</Tooltip2>
					)
				})}
				<Popover2
					position={Position.BOTTOM_LEFT}
					portalContainer={portalContainer}
					content={
						<Menu>
							{SelectToolSubMenu.map((item: any, idx: number) => {
								if (item.divider) {
									return <MenuDivider key={`TBSD_${idx}`} {...item} />;
								}
								else if (item.checkbox) {
									const checked = editor[item.checkboxProperty];
									return (
										<MenuItem
											key={item.id}
											id={item.id}
											icon={item.icon}
											text={(checked && item.checkedText) ? item.checkedText : item.text}
											shouldDismissPopover={false}
											labelElement={<Icon icon={checked ? 'tick' : 'blank'} />}
											onClick={() => {
												dispatch(actionSelectFnCheckboxChanged(item.checkboxProperty));
											}}
										/>
									);
								}
								return (
									<MenuItem
										key={item.id}
										id={item.id}
										icon={item.icon}
										text={item.text}
										labelElement={item.hotkey ? <KeyCombo combo={item.hotkey} /> : undefined}
										onClick={() => {
											item.action && dispatch(item.action(editor));
										}}
									/>
								);
							})}
						</Menu>
					}
					renderTarget={({ isOpen, ref, ...targetProps }) => (
						<Button
							{...targetProps}
							elementRef={ref}
							active={isOpen}
							disabled={!isSelectionNonEmpty}
							id="TBEX_SELECT"
							key="TBEX_SELECT"
							rightIcon="caret-down"
							text="MORE"
						/>
					)}
				/>
			</ButtonGroup>
		</Navbar.Group>
	) : null;
}

export default SelectTools;
