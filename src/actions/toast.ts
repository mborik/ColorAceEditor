/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019-2022 Martin Bórik
 */

import { Toaster, ToastProps } from '@blueprintjs/core';
import { DispatchAction, EditorAction } from '.';


const toast = Toaster.create();

export const showToast = (opt: ToastProps) => {
  toast.clear();
  toast.show(opt);
};

export const actionToast = (toastParams: ToastProps): DispatchAction => ({
  type: EditorAction.Toast,
  payload: {
    intent: 'warning',
    icon: 'warning-sign',
    ...toastParams
  }
});
