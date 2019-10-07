/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2019 Martin Bórik
 */

import { IToastProps, Toaster } from "@blueprintjs/core";
import { EditorAction, EditorReducerAction } from "./base";


const toast = Toaster.create();

export const showToast = (opt: IToastProps) => {
	toast.clear();
	toast.show(opt);
};

export const actionToast = (toastParams: IToastProps): EditorReducerAction => ({
	type: EditorAction.Toast,
	payload: {
		intent: 'warning',
		icon: 'warning-sign',
		message: 'something happen!?',
		...toastParams
	}
});
