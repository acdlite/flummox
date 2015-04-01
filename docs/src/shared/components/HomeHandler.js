import React from 'react';
import connectToStores from 'flummox/connect';
import Doc from './Doc';

class HomeHandler extends React.Component {
  render() {
    const { doc } = this.props;

    if (!doc) return <span />;

    return <Doc doc={doc} />;
  }
}

HomeHandler = connectToStores(HomeHandler, {
  docs: store => ({
    doc: store.getDoc('index')
  })
});

export default HomeHandler;
