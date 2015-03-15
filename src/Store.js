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
    this.state = null;

    this._handlers = {};
    this._asyncHandlers = {};
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

    this._handlers[actionId] = handler.bind(this);
  }

  registerAsync(actionId, beginHandler, successHandler, failureHandler) {
    actionId = ensureActionId(actionId);

    const asyncHandlers = {
      begin: beginHandler,
      success: successHandler,
      failure: failureHandler,
    };

    for (let key in asyncHandlers) {
      if (!asyncHandlers.hasOwnProperty(key)) continue;

      const handler = asyncHandlers[key];

      if (typeof handler === 'function') {
        asyncHandlers[key] = handler.bind(this);
      } else {
        delete asyncHandlers[key];
      }
    }

    this._asyncHandlers[actionId] = asyncHandlers;
  }

  waitFor(tokensOrStores) {
    this._waitFor(tokensOrStores);
  }

  handler(payload) {
    const {
      body,
      actionId,
      async: _async,
      actionArgs,
      error
    } = payload;

    let _handler = this._handlers[actionId];
    const _asyncHandler = this._asyncHandlers[actionId]
      && this._asyncHandlers[actionId][_async];

    if (_async) {
      switch (_async) {
        case 'begin':
          if (typeof _asyncHandler === 'function') {
            this._performHandler.apply(this, [_asyncHandler].concat(actionArgs));
          }
          return;
        case 'failure':
          if (typeof _asyncHandler === 'function') {
            this._performHandler.apply(this, [_asyncHandler].concat(error).concat(actionArgs));
          }
          return;
        case 'success':
          if (typeof _asyncHandler === 'function') {
            _handler = _asyncHandler;
          }
          break;
        default:
          return;
      }
    }

    if (typeof _handler !== 'function') return;
    this._performHandler(_handler, body);
  }

  _performHandler(_handler, ...args) {
    this._isHandlingDispatch = true;
    this._pendingState = this._assignState(undefined, this.state);
    this._emitChangeAfterHandlingDispatch = false;

    try {
      _handler.apply(this, args);
    } finally {
      if (this._emitChangeAfterHandlingDispatch) {
        this.state = this._pendingState;
        this.emit('change');
      }

      this._isHandlingDispatch = false;
      this._pendingState = undefined;
      this._emitChangeAfterHandlingDispatch = false;
    }
  }
}

function ensureActionId(actionOrActionId) {
  return typeof actionOrActionId === 'function'
    ? actionOrActionId._id
    : actionOrActionId;
}
