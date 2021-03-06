import loaderUtils from 'loader-utils';
import path from 'path';
import crypto from 'crypto';

function getStyleId(context, filepath) {
  const hash = crypto.createHash('md5');
  hash.update(filepath);
  const moduleId = hash.digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return moduleId;
}

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

  const filepath = path.relative(this.options.context, this.resource);
  const getStyleIdFunc = options.getStyleId || getStyleId;
  const moduleId = getStyleIdFunc(this.options.context, filepath);

  return `
    var canUseDOM = require(${loaderUtils.stringifyRequest(this, require.resolve('./canUseDOM'))}).default;
    function formatContent(c) {
      return (typeof c === 'string') ? [[module.id, content, '']] : c;
    }
    var moduleId = '${moduleId}';
    var content = formatContent(require(${loaderUtils.stringifyRequest(this, `!!${remainingRequest}`)}));
    var insertCss = require('isomorphic-style/insertCss').default;
    var ref = 0;
    var removeCss = null;
    module.exports = content.locals || {};
    module.exports.getContent = function() { return content.toString(); };
    module.exports.insertCss = function() {
      if (canUseDOM) {
        ref += 1;
        if(ref === 1) {
          removeCss = insertCss(moduleId, content, ${optionString});
        }
      } else {
        removeCss = insertCss(moduleId, content, ${optionString});
      }
      return removeCss;
    };
    module.exports.removeCss = function() {
      if (canUseDOM) {
        ref--;
        if(ref < 0) { ref = 0 };
        if(ref < 1) {
          removeCss();
          removeCss = null;
        }
      }
    };

    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (module.hot && typeof window !== 'undefined' && window.document) {
      module.hot.accept(${loaderUtils.stringifyRequest(this, `!!${remainingRequest}`)}, function() {
        content = formatContent(require(${loaderUtils.stringifyRequest(this, `!!${remainingRequest}`)}));
            module.exports.insertCss = function() {
              if (canUseDOM) {
                ref += 1;
                if(ref === 1) {
                  removeCss = insertCss(moduleId, content, ${optionString});
                }
              } else {
                removeCss = insertCss(moduleId, content, ${optionString});
              }
              return removeCss;
            };
        if (removeCss !== null) {
          removeCss = insertCss(moduleId, content, ${optionString}, true);
        }
      });
      module.hot.dispose(function() { removeCss(); removeCss = null; });
    }
  `;
};
