'use strict';

module.exports = function() {
  var tasks = require('gulp-do');
    
  return tasks.do('clean').then(tasks.get('node'));
};
