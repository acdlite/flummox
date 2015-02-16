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

class TestActions extends Actions {
  constructor(asyncActions) {
    asyncActions.forEach(action => this.constructor.prototype[action] = TestActionsAsyncResponse.defaultResponse);
    super();
  }
}

function isFunc(func) {
  return typeof func === 'function';
}

export {
  TestActionsAsyncResponse,
  TestActions,
};