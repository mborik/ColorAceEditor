/*
 * PMD 85 ColorAce picture editor
 * FillShape component
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import * as React from 'react';
import { Button, KeyCombo, Navbar, Position } from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';

import { actionFillShapeChanged } from '../actions';
import constants from '../constants';
import { EditorTool,useEditor } from '../editor';
import { OVERLAY_WRAPPER } from '../elements';


const FillShape: React.VFC = () => {
  const { dispatch, editor } = useEditor();

  const isActive: boolean = (editor?.editFilled === true);
  const isVisible: boolean = (
    editor?.editTool === EditorTool.Ellipse ||
    editor?.editTool === EditorTool.Rectangle
  );

  return isVisible ? (
    <Navbar.Group align="right">
      <Tooltip2
        position={Position.BOTTOM_RIGHT}
        hoverOpenDelay={constants.TOOLTIP_TIMEOUT}
        portalContainer={OVERLAY_WRAPPER()}
        content={<>
          <label>filled shape</label>
          <KeyCombo combo="V" />
        </>}
        renderTarget={({ isOpen: _, ref: elementRef, ...targetProps }) => (
          <Button
            {...targetProps}
            id={EditorTool.FillShape}
            key={EditorTool.FillShape}
            icon='contrast'
            active={isActive}
            intent={isActive ? 'primary' : undefined}
            elementRef={elementRef}
            onClick={() => {
              dispatch(actionFillShapeChanged(!isActive));
            }}
          />
        )}
      />
    </Navbar.Group>
  ) : null;
};

export default FillShape;
