require('../server');

import { exec } from 'mz/child_process';
import { rename } from 'mz/fs';
import _mkdirp from 'mkdirp';
import readdirp from 'readdirp';
import { map } from 'event-stream';
import path from 'path';

const outputRoot = path.resolve(process.cwd(), 'dist');

async () => {
  await exec('wget -p -P dist/ -m -nH -erobots=off --reject index.html --html-extension http://localhost:3000/flummox');
  await exec('cp -a public/flummox/data dist/flummox/data');

  const docStream = readdirp({ root: outputRoot, fileFilter: '*.html' })
    .pipe(map((entry, cb) => {
      const { path: relativePath } = entry;
      const { name } = path.parse(relativePath);
      const originalPath = path.resolve(outputRoot, relativePath);
      const dir = path.resolve(originalPath, `../${name}`);
      const newPath = path.resolve(dir, 'index.html');

      async () => {
        await mkdirp(dir);
        await rename(originalPath, newPath);
        cb(null);
      }().catch(error => cb(error));
    }))
    .on('error', error => console.log(error))
    .on('end', () => {
      process.exit(0);
    });
}();

function mkdirp(dir) {
  return new Promise((resolve, reject) => _mkdirp(dir, (err) => {
    if (err) reject(err);
    resolve();
  }));
}
