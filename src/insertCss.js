import canUseDOM from './canUseDOM';
import { collect } from './collect';

function noop() {}
let insertLoc = null;

// Base64 encoding and decoding - The "Unicode Problem"
// https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) =>
                                              String.fromCharCode(`0x${p1}`)));
}

class StyleObj {
  constructor(id, cssText, media) {
    this.id = id;
    this.cssText = cssText;
    this.media = media;
    this.created = false;
    this.element = null;
  }

  update() {
    if (!canUseDOM || !this.element) {
      return false;
    }
    if ('textContent' in this.element) {
      this.element.textContent = this.cssText;
    } else {
      this.element.styleSheet.cssText = this.cssText;
    }
    return true;
  }

  create() {
    if (!canUseDOM && this.element) {
      return false;
    }
    this.element = document.createElement('style');
    this.element.id = this.id;
    if (this.media) {
      this.element.setAttribute('media', this.media);
    }
    if ('textContent' in this.element) {
      this.element.textContent = this.cssText;
    } else {
      this.element.styleSheet.cssText = this.cssText;
    }
    return true;
  }

  toStyleText() {
    const media = this.media ? `media=" ${this.media}"` : '';
    return `<style id="${this.id}" ${media}>${this.cssText}</style>`;
  }
}

export default function insertCss(moduleId, styles = [], options = {}, force = false) {
  const { insertAt, prefix } = Object.assign({
    insertAt: 'bottom',
    prefix: 'isomorphic_style_',
  }, options);

  for (let i = 0, len = styles.length; i < len; i += 1) {
    const style = styles[i];
    // style[0] is module.id or module name
    const css = style[1];
    const media = style.length > 2 ? style[2] : null;
    const sourceMap = style.length > 3 ? style[3] : null;
    const id = `${moduleId}-${i}`;

    let cssText = css;
    if (sourceMap && btoa) { // skip IE9 and below, see http://caniuse.com/atob-btoa
      cssText += `\n/*# sourceMappingURL=data:application/json;base64,${
        b64EncodeUnicode(JSON.stringify(sourceMap))}*/`;
      cssText += `\n/*# sourceURL=${sourceMap.file}?${id}*/`;
    }

    const styleObj = new StyleObj(`${prefix}${id}`, cssText, media);
    if (canUseDOM) {
      styleObj.element = document.getElementById(styleObj.id);
      if (!styleObj.element) {
        if (styleObj.create()) {
          if (insertAt === 'top') {
            document.head.insertBefore(styleObj.element, document.head.childNodes[0]);
          } else if (insertAt === 'bottom') {
            document.head.appendChild(styleObj.element);
          } else {
            insertLoc = insertLoc || document.getElementById(insertAt);
            if (insertLoc) {
              document.head.insertBefore(styleObj.element, insertLoc);
            } else {
              throw Error(`insertAt === '${insertAt}' does not exist`);
            }
          }
        }
      } else if (force) {
        styleObj.update();
      }
    }

    style.removeCss = () => {
      if (canUseDOM && styleObj.element) {
        document.head.removeChild(styleObj.element);
      }
      style.removeCss = noop;
    };
    collect(styleObj.id, styleObj);
  }

  // return removeCss function
  return () => {
    for (let i = 0, len = styles.length; i < len; i += 1) {
      styles[i].removeCss();
    }
  };
}
