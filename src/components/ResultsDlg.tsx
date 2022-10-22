/*
 * PMD 85 ColorAce picture editor
 * Point Coords Recorder results dialog component
 *
 * Copyright (c) 2019-2022 Martin Bórik
 */

import React, { useCallback, useMemo, useState } from 'react';
import { Button, Classes, Dialog, NonIdealState, Switch, TextArea } from '@blueprintjs/core';
import { actionResults } from '../actions';
import { useEditor } from '../editor';
import { toHex } from '../utils';


const ResultsDlg: React.VFC = () => {
  const { dispatch, coordsResultsDialogOpen, editor } = useEditor();
  const [ hex, setHex ] = useState(false);

  const results = useMemo(() => {
    if (!editor || !coordsResultsDialogOpen) {
      return null;
    }

    return editor.coordsRecorder.map(({ x, y }) => {
      if (hex) {
        return `\t	db	#${toHex(x)}, #${toHex(y)}`;
      }
      else {
        return `\t	db	${x}, ${y}`;
      }
    }).join('\n');
  },
  [ editor, coordsResultsDialogOpen, hex ]);

  const handleCleanupData = useCallback(() => {
    if (editor) {
      editor.coordsRecorder.splice(0);
      dispatch(actionResults(false));
    }
  },
  [ dispatch, editor ]);

  return (
    <Dialog
      className="results-dlg"
      icon="th-derived"
      title="Point Coordinates Recorder results"
      canEscapeKeyClose={false}
      isOpen={coordsResultsDialogOpen}
      onClose={() => dispatch(actionResults(false))}>

      <div className={Classes.DIALOG_BODY}>
        {results ? (
          <TextArea
            className="bp4-monospace-text bp4-intent-primary"
            rows={16}
            fill={true}
            readOnly={true}
            value={results}
          />
        ) : (
          <NonIdealState
            icon="search-template"
            title="no points recorded"
          />
        )}

        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          {results && <>
            <Switch
              inline={true}
              alignIndicator="right"
              checked={hex}
              onChange={e => setHex(e.currentTarget.checked)}
              labelElement="radix"
              innerLabelChecked="hex"
              innerLabel="dec"
            />
            <Button
              intent="danger"
              text="Clean &amp; Close"
              onClick={handleCleanupData} />
          </>}

          <Button
            text="Close"
            onClick={() => dispatch(actionResults(false))}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ResultsDlg;
