import loaderUtils from 'loader-utils';

module.exports = function loader() {};
module.exports.pitch = function pitch(remainingRequest) {
  if (this.cacheable) {
    this.cacheable();
  }

  const query = loaderUtils.parseQuery(this.query || '');
  const loaderOptions = this.options || {};
  const options = {
    replace: loaderOptions.replace || query.replace,
    insertAt: loaderOptions.insertAt || query.insertAt,
    prefix: loaderOptions.prefix || query.prefix,
  };

  return `
    var content = require(${loaderUtils.stringifyRequest(this, `!!${remainingRequest}`)});
    var insertCss = require('isomorphic-style/insertCss').default;
    if (typeof content === 'string') {
      content = [[module.id, content, '']];
    }
    var noop = function() {};
    var removeCss = noop;
    module.exports = content.locals || {};
    module.exports.getContent = function() { return content.toString(); };
    module.exports.insertCss = function() { removeCss = insertCss(content, ${JSON.stringify(options)}); };
    module.exports.removeCss = function() { removeCss(); removeCss = noop; };

    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (module.hot && typeof window !== 'undefined' && window.document) {
      module.hot.accept(${loaderUtils.stringifyRequest(this, `!!${remainingRequest}`)}, function() {
        content = require(${loaderUtils.stringifyRequest(this, `!!${remainingRequest}`)});
        if (typeof content === 'string') {
          content = [[module.id, content, '']];
        }
        removeCss = insertCss(content, ${JSON.stringify(Object.assign({}, options, { replace: true }))});
      });
      module.hot.dispose(function() { removeCss(); removeCss = noop; });
    }
  `;
};
