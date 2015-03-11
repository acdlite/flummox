import React from 'react';

export default function addContext(Component, context, contextTypes) {
  return React.createClass({
    childContextTypes: contextTypes,

    getChildContext() {
      return context;
    },

    render() {
      return <Component {...this.props} />;
    }
  });
}
