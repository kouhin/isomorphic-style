import loaderUtils from 'loader-utils';

module.exports = function loader() {};
module.exports.pitch = function pitch(remainingRequest) {
  if (this.cacheable) {
    this.cacheable();
  }

  const query = loaderUtils.parseQuery(this.query || '');
  const loaderOptions = this.options || {};
  const options = {
    insertAt: loaderOptions.insertAt || query.insertAt,
    prefix: loaderOptions.prefix || query.prefix,
  };
  const optionString = JSON.stringify(options);

  return `
    function formatContent(c) {
      return typeof c === 'string' ? [[module.id, content, '']] : c;
    }
    var content = formatContent(require(${loaderUtils.stringifyRequest(this, `!!${remainingRequest}`)}));
    var insertCss = require('isomorphic-style/insertCss').default;
    var noop = function() {};
    var removeCss = noop;
    module.exports = content.locals || {};
    module.exports.getContent = function() { return content.toString(); };
    module.exports.insertCss = function() { removeCss = insertCss(content, ${optionString}); };
    module.exports.removeCss = function() { removeCss(); removeCss = noop; };

    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (module.hot && typeof window !== 'undefined' && window.document) {
      module.hot.accept(${loaderUtils.stringifyRequest(this, `!!${remainingRequest}`)}, function() {
        content = formatContent(require(${loaderUtils.stringifyRequest(this, `!!${remainingRequest}`)}));
        if (removeCss !== noop) {
          removeCss = insertCss(content, ${optionString}, true);
        }
      });
      module.hot.dispose(function() { removeCss(); removeCss = noop; });
    }
  `;
};
