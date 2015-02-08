/**
 * Actions
 *
 * Instances of the Actions class represent a set of actions. (In Flux parlance,
 * these might be more accurately denoted as Action Creators, while Action
 * refers to the payload sent to the dispatcher, but this is... confusing. We
 * will use Action to mean the function you call to trigger a dispatch.)
 *
 * Create actions by extending from the base Actions class and adding methods.
 * All methods on the prototype (except the constructor) will be
 * converted into actions. The return value of an action is used as the body
 * of the payload sent to the dispatcher.
 */

'use strict';

import uniqueId from 'uniqueid';
import assign from 'object-assign';

export default class Actions {

  constructor() {

    this._baseId = uniqueId();
    this._actionIds = {};

    let methodNames = this._getActionMethodNames();
    for (let i = 0; i < methodNames.length; i++) {
      let methodName = methodNames[i];
      this._wrapAction(methodName);
    }

    this.getConstants = this.getActionIds;
  }

  getActionIds() {
    return assign({}, this._actionIds);
  }

  _getActionMethodNames(instance) {
    return Object.getOwnPropertyNames(this.constructor.prototype)
      .filter(name =>
        name !== 'constructor' &&
        typeof this[name] === 'function'
      );
  }

  _wrapAction(methodName) {
    let originalMethod = this[methodName];
    let actionId = this._createActionId(methodName);
    this._actionIds[methodName] = actionId;

    let action = (...args) => {
      let body = originalMethod.call(this, ...args);

      if (isPromise(body)) {
        return body.then(dispatchBody);
      } else {
        return dispatchBody(body);
      }
    }

    let dispatchBody = (body) => {
      if (typeof body === 'undefined') return;

      this._dispatch(actionId, body, methodName);
    }

    this[methodName] = action;
  }

  /**
   * Create unique string constant for an action method, using
   * @param {string} methodName - Name of the action method
   */
  _createActionId(methodName) {
    return `${this._baseId}-${methodName}`;
  }

  _getActionId(methodName) {
    return this._actionIds[methodName];
  }

  _dispatch(actionId, body, methodName) {
    if (!this.dispatch) throw new ReferenceError(
      `You've attempted to perform the action `
    + `${this.constructor.name}#${methodName}, but it hasn't been added `
    + `to a Flux instance.`
    );

    this.dispatch(actionId, body);
  }

}

function isPromise(value) {
  return value && typeof value.then === 'function';
}
