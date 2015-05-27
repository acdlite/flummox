/**
 * Store
 *
 * Stores hold application state. They respond to actions sent by the dispatcher
 * and broadcast change events to listeners, so they can grab the latest data.
 * The key thing to remember is that the only way stores receive information
 * from the outside world is via the dispatcher.
 */

import EventEmitter from 'eventemitter3';
import assign from 'object-assign';

export default class Store extends EventEmitter {

  /**
   * Stores are initialized with a reference
   * @type {Object}
   */
  constructor() {
    super();

    this.state = null;

    // Map of action ids to collection of action handlers
    // Async handlers are categorized as 'begin', 'success', or 'error'
    // Non-async handlers are categorized as 'success'
    this._handlers = {};

    // Like above, except generic handlers are called for every action
    this._genericHandlers = {
      begin: [],
      success: [],
      failure: []
    };

    // Array of { matcher, handler }
    // matcher is called with each payload
    // handler is called if matcher returns true
    this._matchHandlers = [];
  }

  setState(newState) {
    // Do a transactional state update if a function is passed
    if (typeof newState === 'function') {
      const prevState = this._isHandlingDispatch
        ? this._pendingState
        : this.state;

      newState = newState(prevState);
    }

    if (this._isHandlingDispatch) {
      this._pendingState = this._assignState(this._pendingState, newState);
      this._emitChangeAfterHandlingDispatch = true;
    } else {
      this.state = this._assignState(this.state, newState);
      this.emit('change');
    }
  }

  replaceState(newState) {
    if (this._isHandlingDispatch) {
      this._pendingState = this._assignState(undefined, newState);
      this._emitChangeAfterHandlingDispatch = true;
    } else {
      this.state = this._assignState(undefined, newState);
      this.emit('change');
    }
  }

  getStateAsObject() {
    return this.state;
  }

  static assignState(oldState, newState) {
    return assign({}, oldState, newState);
  }

  _assignState(...args){
    return (this.constructor.assignState || Store.assignState)(...args);
  }

  forceUpdate() {
    if (this._isHandlingDispatch) {
      this._emitChangeAfterHandlingDispatch = true;
    } else {
      this.emit('change');
    }
  }

  register(actionId, handler) {
    actionId = ensureActionId(actionId);

    if (typeof handler !== 'function') return;

    const actionHandlers = this._handlers[actionId] || {};
    const actionSuccessHandlers = actionHandlers.success || [];

    actionSuccessHandlers.push(handler.bind(this));

    actionHandlers.success = actionSuccessHandlers;
    this._handlers[actionId] = actionHandlers;
  }

  registerAsync(actionId, beginHandler, successHandler, failureHandler) {
    actionId = ensureActionId(actionId);

    const actionHandlers = this._handlers[actionId] || {};

    const newActionHandlers = {
      begin: beginHandler,
      success: successHandler,
      failure: failureHandler
    };

    for (let handlerType in newActionHandlers) {
      const handler = newActionHandlers[handlerType];

      if (typeof handler !== 'function') continue;

      const actionTypeHandlers = actionHandlers[handlerType] || [];

      actionTypeHandlers.push(handler.bind(this));

      actionHandlers[handlerType] = actionTypeHandlers;
    }

    this._handlers[actionId] = actionHandlers;
  }

  registerAll(handler) {
    if (typeof handler !== 'function') return;

    this._genericHandlers.success.push(handler.bind(this));
  }

  registerAllAsync(beginHandler, successHandler, failureHandler) {
    const newActionHandlers = {
      begin: beginHandler,
      success: successHandler,
      failure: failureHandler
    };

    for (let handlerType in newActionHandlers) {
      const handler = newActionHandlers[handlerType];

      if (typeof handler !== 'function') continue;

      this._genericHandlers[handlerType].push(handler.bind(this));
    }
  }

  registerMatch(matcher, handler) {
    this._matchHandlers.push({
      matcher,
      handler: handler.bind(this)
    });
  }

  waitFor(tokensOrStores) {
    this._waitFor(tokensOrStores);
  }

  handler(payload) {
    const {
      body,
      actionId,
      'async': asyncType,
      actionArgs,
      error
    } = payload;

    // Collect array of all matching action handlers
    const actionHandlers = this._handlers[actionId] || {};
    const genericHandlers = this._genericHandlers;
    const matchHandlers = this._matchHandlers;

    let matchedActionHandlers = [];

    if (asyncType === 'begin' || asyncType === 'failure') {
      const matchedAsyncActionHandlers = actionHandlers[asyncType];
      const matchedAsyncGenericHandlers = genericHandlers[asyncType];

      if (matchedAsyncActionHandlers) {
        matchedActionHandlers = matchedActionHandlers.concat(matchedAsyncActionHandlers);
      }

      if (matchedAsyncGenericHandlers) {
        matchedActionHandlers = matchedActionHandlers.concat(matchedAsyncGenericHandlers);
      }
    } else {
      const matchedSuccessActionHandlers = actionHandlers.success;
      const matchedSuccessGenericHandlers = genericHandlers.success;

      if (matchedSuccessActionHandlers) {
        matchedActionHandlers = matchedActionHandlers.concat(matchedSuccessActionHandlers);
      }

      if (matchedSuccessGenericHandlers) {
        matchedActionHandlers = matchedActionHandlers.concat(matchedSuccessGenericHandlers);
      }
    }

    // Collect handlers that match custom matcher functions
    // These are collected separately because they always receive the payload
    // as the sole argument.
    let customMatchedActionHandlers = [];

    for (let { matcher, handler } of matchHandlers) {
      if (matcher(payload)) {
        customMatchedActionHandlers.push(handler);
      }
    }

    // Determine args to pass to handlers based on action type
    let args;

    switch (asyncType) {
      case 'begin':
        args = [payload];
        break;
      case 'failure':
        args = [error, payload];
        break;
      default:
        args = [body, payload];
    }

    this._isHandlingDispatch = true;
    this._pendingState = this._assignState(undefined, this.state);
    this._emitChangeAfterHandlingDispatch = false;

    try {
      // Dispatch matched handlers
      for (let actionHandler of matchedActionHandlers) {
        actionHandler(...args);
      }

      // Dispatch custom matched handers
      for (let actionHandler of customMatchedActionHandlers) {
        actionHandler(payload);
      }
    } finally {
      let emit = false;

      if (this._emitChangeAfterHandlingDispatch) {
        emit = true;
        this.state = this._pendingState;
      }

      this._isHandlingDispatch = false;
      this._pendingState = undefined;
      this._emitChangeAfterHandlingDispatch = false;

      if (emit) this.emit('change');
    }
  }
}

function ensureActionId(actionOrActionId) {
  return typeof actionOrActionId === 'function'
    ? actionOrActionId._id
    : actionOrActionId;
}
