import React from 'react';
import Flux from 'flummox/component';
import View from './View';
import Doc from './Doc';

class DocHandler extends React.Component {
  static willTransitionTo(transition, params) {
    const { splat: docPath } = params;

    const canonicalPath = DocHandler.canonicalDocPath(docPath);

    if (docPath !== canonicalPath) transition.redirect(`/flummox/docs/${canonicalPath}`);
  }

  // Redundant since docs have already been fetched, but included for illustration
  static async routerWillRun({ flux, state }) {
    const docActions = flux.getActions('docs');
    const { params: { splat: path } } = state;

    const canonicalPath = DocHandler.canonicalDocPath(path);

    return await docActions.getDoc(canonicalPath);
  }

  static canonicalDocPath(docPath) {
    docPath = docPath.replace(/\.md$/, '');
    docPath = docPath.replace(/\/index\/?$/, '');

    return docPath;
  }

  getDocPath() {
    const { params: { splat: docPath } } = this.props;

    return DocHandler.canonicalDocPath(docPath);
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
