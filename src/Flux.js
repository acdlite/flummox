'use strict';

import Store from './Store';
import Actions from './Actions';
import { Dispatcher } from 'flux';

export default class Flux {

  constructor() {
    this._stores = new Map();
    this._actions = new Map();
  }

  addStore(key, store) {

    if (this._stores.has(key)) {
      throw new ReferenceError(
        `You've attempted to add multiple stores with key ${key}. Keys must be `
      + `unique. Try choosing different keys, or remove an existing store with `
      + `Flux#removeStore().`
      );
    }

    this._stores.set(key, store);
  }

  getStore(key) {
    return this._stores.get(key);
  }

  removeStore(key) {
    this._stores.delete(key);
  }

  addActions(key, actions) {

    if (this._actions.has(key)) {
      throw new ReferenceError(
        `You've attempted to add multiple actions with key ${key}. Keys must `
      + `be unique. Try choosing different keys, or remove existing actions `
      + `with Flux#removeActions().`
      );
    }

    this._actions.set(key, actions);
  }

}

export {
  Flux,
  Store,
  Actions,
};
