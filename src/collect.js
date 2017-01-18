class Styles {
  constructor() {
    this.styles = [];
    this.ids = [];
  }

  add(id, styleObj) {
    if (this.ids.indexOf(id) === -1) {
      this.ids.push(id);
      this.styles.push(styleObj);
    }
  }
}

let stylesInstance = null;

export function collect(id, styleObj) {
  if (!stylesInstance) {
    return;
  }
  stylesInstance.add(id, styleObj);
}

/**
 * Example
 *
 * collect((style) => {
 *
 * });
 *
 */
export function collectStyles(fn) {
  stylesInstance = new Styles();
  const result = fn();
  const styles = [];
  const stylesResult = stylesInstance.styles;
  for (let i = 0, len = stylesResult.length; i < len; i += 1) {
    styles.push(stylesResult[i].toStyleText());
  }
  stylesInstance = null;
  return [
    styles,
    result,
  ];
}
