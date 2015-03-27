import { Flummox } from 'flummox';
import DocActions from './actions/DocActions';
import DocStore from './stores/DocStore';

export default class Flux extends Flummox {
  constructor() {
    super();

    const docActions = this.createActions('docs', DocActions);
    this.createStore('docs', DocStore, { docActions });
  }
}
