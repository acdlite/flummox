'use strict';

import arrayIncludes from './arrayIncludes';
import constantCase from 'constant-case';

export default class Actions {

  constructor() {
    this._createConstants();
  }

  getConstants() {
    return this._constants;
  }

  _createConstants() {
    this._constants = this._getActionMethodNames()
      .reduce((result, methodName) => {
        let constantName = constantCase(methodName);
        result[constantName] = Symbol(methodName);
        return result;
      }, {});
  }

  _getActionMethodNames(instance) {
    return Object.getOwnPropertyNames(this.constructor.prototype)
      .filter(name =>
        typeof this[name] === 'function' &&
        !arrayIncludes(RESERVED_METHOD_NAMES, name)
      );
  }

}

const RESERVED_METHOD_NAMES = [
  'constructor',
  'getConstants',
  '_createConstants',
  '_getActionMethodNames',
];
