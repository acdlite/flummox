/**
 * React Flux Component
 *
 * Component form of ReactMixin. Uses ReactMixin as part of its implementation,
 * so requires a flux instance to be provided as either context or a prop.
 *
 * Like ReactMixin, children are given access to the flux instance via
 * `context.flux`. Use this near the top of your app hierarchy and all children
 * will (including, of course, other Flux components!) have easy access to the
 * flux instance:
 *
 * <FluxComponent flux={flux}>
 *    ...the rest of your app
 * </FluxComponent>
 *
 * Now any child can access the flux instance again like this:
 *
 * <FluxComponent>
 *    ...children
 * </FluxComponent>
 *
 * We don't need the flux prop this time because flux is already part of
 * the context.
 *
 * Additionally, immediate children are given a `flux` prop.
 *
 * The component has an optional prop `connectToStores`, which is -- you guessed
 * it -- passed directly to ReactMixin's `conntectToStores()` function and
 * set as the initial state. The component's state is injected as props to
 * child components.
 *
 * The practical upshot of all this is that ReactMixin, state changes, and
 * context are now simply implementation details. Among other things, this means
 * you can write your components as plain ES6 classes. Here's an example:
 *
 * class ParentComponent extends React.Component {
 *
 *   render() {
 *     <FluxComponent connectToStore="fooStore">
 *       <ChildComponent>
 * 		 </FluxComponent>
 *   }
 *
 * }
 *
 * ChildComponent in this example has prop `flux` containing the flux instance,
 * and props that sync with each of the state keys of fooStore.
 */

'use strict';

import React from 'react/addons';
import ReactMixin from './ReactMixin';
import assign from 'object-assign';

let ReactFluxComponent = React.createClass({

  mixins: [ReactMixin()],

  getInitialState() {
    return this.connectToStores(this.props.connectToStores);
  },

  render() {
    if (!this.props.children) return null;

    let children = React.Children.map(this.props.children, child =>
      React.addons.cloneWithProps(child, assign({
        key: child.key || undefined,
        flux: this.flux,
      }, this.state))
    );

    return <span>{children}</span>;
  }

});

export default ReactFluxComponent;
