import React from 'react';
import Flux from 'flummox/component';
import View from './View';
import Doc from './Doc';

class DocHandler extends React.Component {
  static willTransitionTo(transition, params) {
    const { splat: docPath } = params;

    const canonicalPath = DocHandler.normalizeDocPath(docPath);

    if (docPath !== canonicalPath) transition.redirect(`/flummox/${canonicalPath}`);
  }

  static normalizeDocPath(docPath) {
    const canonicalPath = docPath.replace(/\/index\/?$/, '');

    return canonicalPath;
  }

  getDocPath() {
    const { params: { splat: docPath } } = this.props;

    return DocHandler.normalizeDocPath(docPath);
  }

  render() {
    const docPath = this.getDocPath();

    return (
      <div>
        <Flux
          docPath={docPath}
          connectToStores={{
            docs: (store, props) => ({
              doc: store.getDoc(props.docPath)
            })
          }}
          render={({ doc }) => <Doc doc={doc} />}
        />
      </div>
    );
  }
}

export default DocHandler;
