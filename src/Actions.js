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

    let methodNames = this._getActionMethodNames();
    for (let i = 0; i < methodNames.length; i++) {
      let methodName = methodNames[i];
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

    let action = (...args) => {
      let body = originalMethod.apply(this, args);

      if (isPromise(body)) {
        let promise = body;
        this._dispatchAsync(actionId, promise, args, methodName)
          // Catch errors and do nothing
          // They can be handled by store or caller
          .catch(error => {});

        return promise;
      } else {
        return this._dispatch(actionId, body, args, methodName);
      }
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

  _dispatch(actionId, body, args, methodName) {
    if (typeof this.dispatch === 'function') {
      if (typeof body !== 'undefined') {
        this.dispatch(actionId, body, args);
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `You've attempted to perform the action `
        + `${this.constructor.name}#${methodName}, but it hasn't been added `
        + `to a Flux instance.`
        );
      }
    }

    return body;
  }

  _dispatchAsync(actionId, promise, args, methodName) {
    if (typeof this.dispatchAsync === 'function') {
      return this.dispatchAsync(actionId, promise, args);
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `You've attempted to perform the asynchronous action `
        + `${this.constructor.name}#${methodName}, but it hasn't been added `
        + `to a Flux instance.`
        );
      }

      return promise;
    }

  }

}

function isPromise(value) {
  return value && typeof value.then === 'function';
}
