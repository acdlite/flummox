import { Store } from 'flummox';
import { Map } from 'immutable';

export default class DocStore extends Store {
  constructor({ docActions }) {
    super();

    this.register(docActions.getDoc, this.handleNewDoc);
    this.register(docActions.getAllDocs, this.handleNewDocs);

    this.state = {
      docs: new Map()
    };
  }

  handleNewDoc(newDoc) {
    const docs = {
      [newDoc.path]: newDoc
    };

    this.setState({
      docs: this.state.docs.merge(docs)
    });
  }

  handleNewDocs(newDocs) {
    const docs = newDocs.reduce((result, doc) => {
      result[doc.path] = doc;
      return result;
    }, {});

    this.setState({
      docs: this.state.docs.merge(docs)
    });
  }

  getDoc(path) {
    let doc = this.state.docs.find(doc => doc.get('path') === path);

    if (!doc) {
      doc = this.state.docs.find(doc => doc.get('path') === `${path}/index`);
    }

    return doc;
  }
}
