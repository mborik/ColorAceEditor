/*
 * PMD 85 ColorAce picture editor
 * Palette component
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import * as React from 'react';
import { Button, ButtonGroup, Icon, IconSize, KeyCombo, Navbar, Position } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';

import { actionColorChanged } from '../actions';
import constants from '../constants';
import { useEditor } from '../editor';
import { OVERLAY_WRAPPER } from '../elements';
import { PaletteItems } from '../params/PaletteItems';


const attrsToTooltip = (attrs?: string[]) => {
  switch (attrs?.length) {
    case 1: return (
      <code>
        attr: <b>{attrs[0]}</b>
      </code>
    );
    case 2: return (
      <code>
        attr0: <b>{attrs[0]}</b><br/>
        attr1: <b>{attrs[1]}</b>
      </code>
    );
    default: return (
      <span>
        no color change<br />
        <i>(attrs not modified)</i>
      </span>
    );
  }
};

const Palette: React.VFC = () => {
  const { dispatch, editor } = useEditor();
  const portalContainer = OVERLAY_WRAPPER();

  return editor ? (
    <Navbar.Group align="center">
      <ButtonGroup fill={true}>
        {PaletteItems.reduce<JSX.Element[]>((acc, item) => {
          if (!item.shouldBeShown(editor)) {
            return acc;
          }

          const { value } = item;
          const isActive = (value === editor.editColor);

          return [
            ...acc,
            (
              <Tooltip2
                key={`${item.id}_TT`}
                position={Position.BOTTOM_RIGHT}
                hoverOpenDelay={constants.TOOLTIP_TIMEOUT}
                portalContainer={portalContainer}
                content={(
                  <>
                    {attrsToTooltip(item.attrs?.(editor))}
                    <KeyCombo combo={value > 0 ? value.toString() : 'D'} />
                  </>
                )}
                renderTarget={({ isOpen: _, ref: elementRef, ...targetProps }) => (
                  <Button
                    {...targetProps}
                    elementRef={elementRef}
                    id={item.id}
                    key={item.id}
                    icon={<Icon
                      icon={item.icon ?? 'symbol-square'}
                      iconSize={item.icon ? IconSize.STANDARD : 24}
                      color={item.color ?? '#ffffff7f'}
                    />}
                    active={isActive}
                    intent={isActive ? 'primary' : 'none'}
                    onClick={() => {
                      !isActive && dispatch(actionColorChanged(value));
                    }}
                  />
                )}
              />
            )];
        }, [])}
      </ButtonGroup>
    </Navbar.Group>
  ) : null;
};

export default Palette;
