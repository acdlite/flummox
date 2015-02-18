'use strict';

import Actions from '../Actions';


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

  if (syncActions) {
    Object.keys(syncActions).forEach(actionName => {
      let actionValue = syncActions[actionName];
      // Ensure action value is a function.
      let actionFunc = isFunc(actionValue) ? actionValue : () => actionValue;
      TestActionsClass.prototype[actionName] = actionFunc;
    });
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