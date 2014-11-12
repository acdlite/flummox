/**
 * The Constants class. Makes it easier to define constants for actions that
 * make calls to an external service, e.g. a REST API.
 * @param {Object} spec - Class specification
 * @param {Object} flux - Flux instance
 */

'use strict';

class Constants {
  constructor(spec, flux) {
    this.flux = flux;

    // Loop through each key in class spec
    for (var key in spec) {

      // Save the spec name
      if (key === 'name') {
        this._name = spec.name;
      }
      // Create additional action types for service success and failure
      else if (key === 'serviceActionTypes') {
        spec.serviceActionTypes.forEach((serviceActionType) => {
          this[serviceActionType] = serviceActionType;
          this[serviceActionType + '_SUCCESS'] = serviceActionType + '_SUCCESS';
          this[serviceActionType + '_FAILURE'] = serviceActionType + '_FAILURE';
        });
      }
      else if (key === 'actionTypes') {
        spec.actionTypes.forEach((actionType) => {
          this[actionType] = actionType;
        });
      }
      else if (typeof spec[key] === 'function') {
        this[key] = spec[key].bind(this);
      }
      else {
        this[key] = spec[key];
      }
    }

    if (typeof this.initialize === 'function') this.initialize();
  }

  /**
   * Gets the name of the constants
   * @returns {String}
   */
  getName() {
    return this._name;
  }
}

module.exports = Constants;
