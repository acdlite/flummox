import { Actions } from 'flummox';
import { siteUrl } from '../utils/UrlUtils';
import join from 'url';

export default class DocActions extends Actions {
  async getDoc(path) {
    const url = siteUrl(join('/flummox/data/docs', `${path}.json`));
    const response = await fetch(url);
    return await response.json();
  }

  async getAllDocs() {
    const url = siteUrl('/flummox/data/allDocs.json');
    const response = await fetch(url);
    return await response.json();
  }
}
