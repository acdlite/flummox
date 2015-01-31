'use strict';

import Store from './Store';
import Actions from './Actions';
import { Dispatcher } from 'flux';
import EventEmitter from 'eventemitter3';

const defaults = {
  debug: false,
};

export default class Flux {

  constructor(options) {
    this.options = Object.assign({}, defaults, options);

    this._stores = new Map();
    this._actions = new Map();
    this.dispatcher = new Dispatcher();
    this._tokens = new Map();
  }

  addStore(key, store) {

    if (this._stores.has(key)) {
      throw new Error(
        `You've attempted to add multiple stores with key ${key}. Keys must be `
      + `unique. Try choosing different keys, or remove an existing store with `
      + `Flux#removeStore().`
      );
    }

    let token = this.dispatcher.register(store.handler.bind(store));

    this._stores.set(key, store);
    this._tokens.set(key, token);
  }

  getStore(key) {
    return this._stores.get(key);
  }

  removeStore(key) {
    this._stores.delete(key);
  }

  addActions(key, actions) {

    if (this._actions.has(key)) {
      throw new Error(
        `You've attempted to add multiple actions with key ${key}. Keys must `
      + `be unique. Try choosing different keys, or remove existing actions `
      + `with Flux#removeActions().`
      );
    }

    actions.flux = this;

    this._actions.set(key, actions);
  }

  getActions(key) {
    return this._actions.get(key);
  }

  getActionIds(key) {
    let actions = this.getActions(key);

    if (!actions) return;

    return actions.getConstants();
  }

  dispatch(actionId, body) {
    this.dispatcher.dispatch({ actionId, body });
  }

}

let Flummox = Flux;

export {
  Flux,
  Flummox,
  Store,
  Actions,
};
