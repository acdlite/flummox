export function simulateAction(store, action, body) {
	const actionId = ensureActionId(action);
	store.handler({ actionId, body });
}

export function simulateActionAsync(store, action, asyncAction, ...args) {
	const actionId = ensureActionId(action);
	let payload = { 
		actionId, async: asyncAction
	};

	switch(asyncAction) {
		case 'begin':
			payload.actionArgs = args;
			break;
		case 'success':
			payload.body = args[0];
			break;
		case 'failure':
			payload.error = args[0];
			break;
		default:
			throw new Error('asyncAction must be one of: begin, success, failure');
			break;
	}

	store.handler(payload);
}

function ensureActionId(actionOrActionId) {
  return typeof actionOrActionId === 'function'
    ? actionOrActionId._id
    : actionOrActionId;
}