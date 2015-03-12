/**
 * Used for simulating actions on stores when testing.
 *
 */
export function simulateAction(store, action, body) {
  const actionId = ensureActionId(action);
  store.handler({ actionId, body });
}

/**
 * Used for simulating asynchronous actions on stores when testing.
 *
 * asyncAction must be one of the following: begin, success or failure.
 *
 * When simulating the 'begin' action, all arguments after 'begin' will
 * be passed to the action handler in the store.
 *
 * @example
 *
 * TestUtils.simulateActionAsync(store, 'actionId', 'begin', 'arg1', 'arg2');
 * TestUtils.simulateActionAsync(store, 'actionId', 'success', { foo: 'bar' });
 * TestUtils.simulateActionAsync(store, 'actionId', 'failure', new Error('action failed'));
 */
export function simulateActionAsync(store, action, asyncAction, ...args) {
  const actionId = ensureActionId(action);
  const payload = {
    actionId, async: asyncAction
  };

  switch(asyncAction) {
    case 'begin':
      if (args.length) {
        payload.actionArgs = args;
      }
      break;
    case 'success':
      payload.body = args[0];
      break;
    case 'failure':
      payload.error = args[0];
      break;
    default:
      throw new Error('asyncAction must be one of: begin, success or failure');
  }

  store.handler(payload);
}

function ensureActionId(actionOrActionId) {
  return typeof actionOrActionId === 'function'
    ? actionOrActionId._id
    : actionOrActionId;
}
