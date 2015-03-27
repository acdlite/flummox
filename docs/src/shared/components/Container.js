import React from 'react';

class Container extends React.Component {
  render() {
    const { className, ...props } = this.props;

    return (
      <div
        {...props}
        className={[ 'Container', className ].filter(Boolean).join(' ')}
      />
    );
  }
}

export default Container;
