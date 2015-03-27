require('../shared/init');

import frontmatter from 'front-matter';
import { writeFile, readFile } from 'mz/fs';
import path from 'path';
import readdirp from 'readdirp';
import _mkdirp from 'mkdirp';
import { map, writeArray } from 'event-stream';

const docsRoot = path.join(process.cwd(), 'docs');
const dataRoot = path.join(process.cwd(), 'public/flummox/data');

const docStream = readdirp({ root: docsRoot, fileFilter: '*.md' })
  .pipe(map((entry, cb) => {
    async () => {
      const { fullPath, path } = entry;

      const contents = await readFile(fullPath, 'utf8');

      const { attributes, body } = frontmatter(contents);

      return {
        path: path.slice(0, -3), // remove .md extension
        content: body,
        ...attributes,
      };
    }()
      .then(
        result => cb(null, result),
        err => cb(err)
      );
  }));

// Write to individual JSON document
docStream.pipe(map((doc, cb) => {
  async () => {
    const dest = path.format({
      root: '/',
      dir: path.join(dataRoot, 'docs', path.dirname(doc.path)),
      base: `${path.basename(doc.path)}.json`,
    });

    const dir = path.dirname(dest);

    await mkdirp(dir);

    await writeFile(dest, JSON.stringify(doc));
  }()
    .then(
      () => cb(null),
      err => cb(err)
    );
}));

// Write combined JSON document
docStream.pipe(writeArray((_, docs) => {
  writeFile(path.join(dataRoot, 'allDocs.json'), JSON.stringify(docs));
}));

function mkdirp(dir) {
  return new Promise((resolve, reject) => _mkdirp(dir, (err) => {
    if (err) reject(err);
    resolve();
  }));
}
