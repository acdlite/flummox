/**
 * Flux Component
 *
 * Component form of fluxMixin. Uses fluxMixin as part of its implementation,
 * so requires a flux instance to be provided as either context or a prop.
 *
 * Like fluxMixin, children are given access to the flux instance via
 * `context.flux`. Use this near the top of your app hierarchy and all children
 * will have easy access to the flux instance (including, of course, other
 * Flux components!):
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
 * it -- passed directly to fluxMixin's `connectToStores()` function and
 * set as the initial state. The component's state is injected as props to
 * child components.
 *
 * The practical upshot of all this is that fluxMixin, state changes, and
 * context are now simply implementation details. Among other things, this means
 * you can write your components as plain ES6 classes. Here's an example:
 *
 * class ParentComponent extends React.Component {
 *
 *   render() {
 *     <FluxComponent connectToStore="fooStore">
 *       <ChildComponent />
 *     </FluxComponent>
 *   }
 *
 * }
 *
 * ChildComponent in this example has prop `flux` containing the flux instance,
 * and props that sync with each of the state keys of fooStore.
 */
 
import React from 'react';
import fluxMixin from './fluxMixin';
import assign from 'object-assign';

let FluxComponent = React.createClass({

  mixins: [fluxMixin()],

  getInitialState() {
    return this.connectToStores(this.props.connectToStores);
  },

  wrapChild(child) {
    let { children, connectToStores, ...props } = this.props;

    return React.addons.cloneWithProps(child, assign({
      flux: this.flux,
    }, this.state, props));
  },

  render() {
    let { children } = this.props;

    if (!this.props.children) return null;

    if (React.Children.count(children) === 1) {
      let child = children;
      return this.wrapChild(child);
    } else {
      return <span>{React.Children.map(children, this.wrapChild)}</span>;
    }
  }

});

export default FluxComponent;
