'use strict';

import Actions from '../Actions';

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


export function TestActions(asyncActions) {
  class TestActionsClass extends Actions {
    constructor() {
      super();
    }
  }

  if (Array.isArray(asyncActions)) {
    asyncActions.forEach(action => 
      TestActionsClass.prototype[action] = TestActionsAsyncResponse.defaultResponse
    );
  }

  return TestActionsClass;
}

function isFunc(func) {
  return typeof func === 'function';
}

export {
  TestActionsAsyncResponse
};