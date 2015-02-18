'use strict';

import Actions from '../Actions';

/**
 * TestActions
 *
 * Exports a function that creates a dynamic actions class for use 
 * with testing.
 *
 * The function expects the first argument to be an array of async
 * action names. Sync actions can be defined in the same way by 
 * passing a second array.
 *
 * When calling an async action a utility class will be returned which 
 * can be completed by calling success(...args) or fail(...args). 
 * 
 * @example
 * let actions = flux.createActions('actions', TestActions(['async1'], ['sync1']));
 * let action = actions.async1();
 *
 * action.success('Action 1 succeeded');
 * action.fail('Action 1 failed');
 *
 * actions.sync1();
 * 
 */
export function TestActions(asyncActions, syncActions) {
  class TestActionsClass extends Actions {
    constructor() {
      super();
    }
  }

  if (Array.isArray(asyncActions)) {
    asyncActions.forEach(actionName => 
      TestActionsClass.prototype[actionName] = TestActionsAsyncResponse.defaultResponse
    );
  }

  if (Array.isArray(syncActions)) {
    syncActions.forEach(actionName => 
      TestActionsClass.prototype[actionName] = () => true
    );
  }

  return TestActionsClass;
}

class TestActionsAsyncResponse {
  constructor() {
    this._success = [];
    this._fail = [];
  }

  then(success, fail) {
    if (isFunc(success)) {
      this._success.push(success);
    }

    if (isFunc(fail)) {
      this._fail.push(fail);
    }

    return this;
  }

  success(...successArgs) {
    this._success.forEach(callback => callback.apply(this, successArgs));
  }

  fail(...failArgs) {
    this._fail.forEach(callback => callback.apply(this, failArgs));
  }

  static defaultResponse() {
    return new TestActionsAsyncResponse();
  }
}

function isFunc(func) {
  return func && typeof func === 'function';
}

export {
  TestActionsAsyncResponse
};