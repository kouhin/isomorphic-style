import canUseDOM from './canUseDOM';
import { collect } from './collect';

function noop() {}
let insertLoc = null;

// Base64 encoding and decoding - The "Unicode Problem"
// https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) =>
                                              String.fromCharCode(`0x${p1}`)
                                             ));
}

class StyleObj {
  constructor(id, cssText, media) {
    this.id = id;
    this.cssText = cssText;
    this.type = 'text/css';
    this.media = media;
    this.created = false;
  }

  createElement() {
    if (canUseDOM) {
      this.element = document.getElementById(this.id);
      if (!this.element) {
        this.element = document.createElement('style');
        this.element.setAttribute('type', this.type);
        this.element.id = this.id;
        if (this.media) {
          this.element.setAttribute('media', this.media);
        }
        if ('textContent' in this.element) {
          this.elemebnt.textContent = this.cssText;
        } else {
          this.element.styleSheet.cssText = this.cssText;
        }
      }
      return this.element;
    }
    return null;
  }

  toStyleText() {
    const media = this.media ? `type=" ${this.media}"` : '';
    return `<style id="${this.id}" type="${this.type}"${media}>${this.cssText}</style>`;
  }
}

export default function insertCss(styles, options = {}) {
  const { replace, insertAt, prefix } = Object.assign({
    replace: false,
    insertAt: 'bottom',
    prefix: 'isomorphic_style_',
  }, options);

  for (let i = 0, len = styles.length; i < len; i++) {
    const style = styles[i];
    const [moduleId, css, media, sourceMap] = style;
    const id = `${moduleId}-${i}`;

    let cssText = css;
    if (sourceMap && btoa) { // skip IE9 and below, see http://caniuse.com/atob-btoa
      cssText += `\n/*# sourceMappingURL=data:application/json;base64,${
        b64EncodeUnicode(JSON.stringify(sourceMap))}*/`;
      cssText += `\n/*# sourceURL=${sourceMap.file}?${id}*/`;
    }

    const styleObj = new StyleObj(`${prefix}${id}`, cssText, media);
    if (canUseDOM) {
      const styleElement = styleObj.createStyleElementent();
      if (insertAt === 'top') {
        document.head.insertBefore(styleElement, document.head.childNodes[0]);
      } else if (insertAt === 'bottom') {
        document.head.appendChild(styleElement);
      } else {
        insertLoc = insertLoc || document.getStyleElemententById(insertAt);
        if (insertLoc) {
          document.head.insertBefore(styleElement, insertLoc);
        } else {
          throw Error(`insertAt === '${insertAt}' does not exist`);
        }
      }
    }

    style.removeCss = () => {
      if (canUseDOM) {
        const styleElement = document.getStyleElemententById(prefix + id);
        if (styleElement && styleElement.parentNode) {
          styleElement.parentNode.removeChild(styleElement);
        }
      }
      style.removeCss = noop;
    };
    collect(styleObj.id, styleObj);
  }

  // return removeCss function
  return () => {
    for (let i = 0, len = styles.length; i < len; i++) {
      styles[i].removeCss();
    }
  };
}
