/**
 * fluxMixin
 *
 * Exports a function that creates a React component mixin. Implements methods
 * from reactComponentMethods.
 *
 * Any arguments passed to the mixin creator are passed to `connectToStores()`
 * and used as the return value of `getInitialState()`. This lets you handle
 * all of the state initialization and updates in a single place, while removing
 * the burden of manually adding and removing store listeners.
 *
 * @example
 * let Component = React.createClass({
 *   mixins: [fluxMixin({
 *     storeA: store => ({
 *       foo: store.state.a,
 *     }),
 *     storeB: store => ({
 *       bar: store.state.b,
 *     })
 *   }]
 * });
 */

import PropTypes from 'prop-types'
import { Flux } from '../Flux';
import { instanceMethods, staticProperties } from './reactComponentMethods';
import assign from 'object-assign';

export default function fluxMixin(...args) {
  function getInitialState() {
    this.initialize();
    return this.connectToStores(...args);
  }

  return assign(
    { getInitialState },
    instanceMethods,
    staticProperties
  );
};
