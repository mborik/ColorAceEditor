import React from 'react';
import { Button, ButtonGroup, Label, Navbar, Tooltip, Position } from "@blueprintjs/core";
import { IconName } from "@blueprintjs/icons";

interface ToolbarItem {
	id: string;
	icon: IconName;
	title: string;
	active?: boolean;
}

const Toolbar: React.FunctionComponent = () => {
	const tools: ToolbarItem[] = [{
		id: 'tool0',
		icon: 'select',
		title: 'selection',
		active: true
	}, {
		id: 'tool1',
		icon: 'new-grid-item',
		title: 'grid selection'
	}, {
		id: 'tool2',
		icon: 'edit',
		title: 'pencil'
	}, {
		id: 'tool3',
		icon: 'highlight',
		title: 'brush'
	}, {
		id: 'tool4',
		icon: 'tint',
		title: 'fill'
	}, {
		id: 'tool5',
		icon: 'new-link',
		title: 'lines'
	}, {
		id: 'tool6',
		icon: 'layout-circle',
		title: 'ellipse'
	}, {
		id: 'tool7',
		icon: 'widget',
		title: 'rectangle'
	}];

	return (
		<Label>
			tool:
			<Navbar.Group align="center">
				<ButtonGroup fill={true}>
				{tools.map(t => (
					<Tooltip
						key={`${t.id}tip`}
						content={t.title}
						position={Position.TOP_RIGHT}
						hoverOpenDelay={250}>

						<Button
							id={t.id}
							icon={t.icon}
							active={!!t.active}
							intent={t.active ? 'primary' : undefined}
						/>
					</Tooltip>
				))}
				</ButtonGroup>
			</Navbar.Group>
		</Label>
	);
}

export default Toolbar;
