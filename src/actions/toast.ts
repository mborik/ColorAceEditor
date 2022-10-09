/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019-2022 Martin Bórik
 */

import { IToastProps, Toaster } from '@blueprintjs/core';
import { DispatchAction, EditorAction } from '.';


const toast = Toaster.create();

export const showToast = (opt: IToastProps) => {
	toast.clear();
	toast.show(opt);
};

export const actionToast = (toastParams: IToastProps): DispatchAction => ({
	type: EditorAction.Toast,
	payload: {
		intent: 'warning',
		icon: 'warning-sign',
		...toastParams
	}
});
