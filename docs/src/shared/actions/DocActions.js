import { Actions } from 'flummox';
import { siteUrl } from '../utils/UrlUtils';

export default class DocActions extends Actions {
  async getDoc(path) {
    let response;

    try {
      const url = siteUrl(`/flummox/data/docs/${path}.json`);
      response = await fetch(url);
      return await response.json();
    } catch (error) {
      const url = siteUrl(`/flummox/data/docs/${path}/index.json`);
      response = await fetch(url);
      return await response.json();
    }
  }

  async getAllDocs() {
    const url = siteUrl('/flummox/data/allDocs.json');
    const response = await fetch(url);
    return await response.json();
  }
}
