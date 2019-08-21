import { INIT_EDITOR_INSTANCE } from "../actions/editor";

const defaultState = {
	editor: null
};

export const editorReducer = (state = defaultState, action: any) => {
	switch (action.type) {
		case INIT_EDITOR_INSTANCE:
			return {
				...state,
				editor: action.payload
			}
	}

	return state;
};
