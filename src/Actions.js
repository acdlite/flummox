/**
 * The Actions class. Makes it easier to dispatch actions on response/error
 * from external service.
 * @param {Object} spec - Class specification
 * @param {Object} flux - Flux instance
 */

'use strict';

class Actions {
  constructor(spec, flux) {
    var self = this;
    this.flux = flux;

    for (var key in spec) {
      // Save the spec name
      if (key === 'name') {
        this._name = spec.name;
      }
      else if (key === 'serviceActions') {
        for (var serviceActionMethodName in spec.serviceActions) {
          var serviceActionTuple = spec.serviceActions[serviceActionMethodName];
          var [serviceActionType, serviceAction] = serviceActionTuple;

          self.registerServiceAction(serviceActionMethodName, serviceActionType, serviceAction);
        }
      }
      else if (typeof spec[key] === 'function') {
        var action = spec[key];
        this[key] = action.bind(this);
      }
      else {
        this[key] = spec[key];
      }
    }

    if (typeof this.initialize === 'function') this.initialize();
  }

  registerServiceAction(name, actionType, handler) {
    var self = this;

    this[name] = function(...args) {
      this.dispatchAction(actionType);
      return handler.apply(self, args)
        .then((response) => {
          self.dispatchAction(actionType + '_SUCCESS', response);
        })
        .catch((error) => {
          self.dispatchAction(actionType + '_FAILURE', {error});
        });
    };
  }

  dispatchAction(actionType, body) {
    var payload = {actionType};

    if (typeof body !== 'undefined') payload.body = body;

    this.flux.dispatch(payload);
  }

  /**
   * Gets the name of the actions
   * @returns {String}
   */
  getName() {
    return this._name;
  }
}

module.exports = Actions;
