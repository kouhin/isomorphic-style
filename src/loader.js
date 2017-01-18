import loaderUtils from 'loader-utils';
import path from 'path';
import crypto from 'crypto';

module.exports = function loader() {};
module.exports.pitch = function pitch(remainingRequest) {
  if (this.cacheable) {
    this.cacheable();
  }

  const filepath = path.relative(this.options.context, this.resource);
  const hash = crypto.createHash('md5');
  hash.update(filepath);
  const moduleId = hash.digest('hex');

  const query = loaderUtils.parseQuery(this.query || '');
  const loaderOptions = this.options || {};
  const options = {
    insertAt: loaderOptions.insertAt || query.insertAt,
    prefix: loaderOptions.prefix || query.prefix,
  };
  const optionString = JSON.stringify(options);

  return `
    function formatContent(c) {
      return (typeof c === 'string') ? [[module.id, content, '']] : c;
    }
    var moduleId = '${moduleId}';
    var content = formatContent(require(${loaderUtils.stringifyRequest(this, `!!${remainingRequest}`)}));
    var insertCss = require('isomorphic-style/insertCss').default;
    var noop = function() {};
    var removeCss = noop;
    module.exports = content.locals || {};
    module.exports.getContent = function() { return content.toString(); };
    module.exports.insertCss = function() { removeCss = insertCss(moduleId, content, ${optionString}); };
    module.exports.removeCss = function() { removeCss(); removeCss = noop; };

    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (module.hot && typeof window !== 'undefined' && window.document) {
      module.hot.accept(${loaderUtils.stringifyRequest(this, `!!${remainingRequest}`)}, function() {
        content = formatContent(require(${loaderUtils.stringifyRequest(this, `!!${remainingRequest}`)}));
        module.exports.insertCss = function() { removeCss = insertCss(moduleId, content, ${optionString}); };
        if (removeCss !== noop) {
          removeCss = insertCss(moduleId, content, ${optionString}, true);
        }
      });
      module.hot.dispose(function() { removeCss(); removeCss = noop; });
    }
  `;
};
