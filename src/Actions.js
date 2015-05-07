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

import uniqueId from 'uniqueid';

export default class Actions {

  constructor() {

    this._baseId = uniqueId();

    const methodNames = this._getActionMethodNames();
    for (let i = 0; i < methodNames.length; i++) {
      const methodName = methodNames[i];
      this._wrapAction(methodName);
    }

    this.getConstants = this.getActionIds;
  }

  getActionIds() {
    return this._getActionMethodNames().reduce((result, actionName) => {
      result[actionName] = this[actionName]._id;
      return result;
    }, {});
  }

  getActionsAsObject() {
    return this._getActionMethodNames().reduce((result, actionName) => {
      result[actionName] = this[actionName];
      return result;
    }, {});
  }

  _getActionMethodNames(instance) {
    return Object.getOwnPropertyNames(this.constructor.prototype)
      .filter(name =>
        name !== 'constructor' &&
        typeof this[name] === 'function'
      );
  }

  _wrapAction(methodName) {
    const originalMethod = this[methodName];
    const actionId = this._createActionId(methodName);

    const action = (...args) => {
      const body = originalMethod.apply(this, args);

      const payload = {
        actionArgs: args
      };

      if (isPromise(body)) {
        const promise = body;
        this.dispatchAsync(actionId, promise, payload);
      } else {
        if (typeof body !== 'undefined') {
          this.dispatch(actionId, body, payload);
        }
      }

      // Return original method's return value to caller
      return body;
    };

    action._id = actionId;

    this[methodName] = action;
  }

  /**
   * Create unique string constant for an action method, using
   * @param {string} methodName - Name of the action method
   */
  _createActionId(methodName) {
    return `${this._baseId}-${methodName}`;
  }

}

function isPromise(value) {
  return value && typeof value.then === 'function';
}
