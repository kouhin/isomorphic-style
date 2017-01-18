export function mountStyle(style = []) {
  const styles = Array.isArray(style) ? style : [style];
  for (let i = 0, len = styles.length; i < len; i += 1) {
    styles[i].insertCss();
  }
}

export function unmountStyle(style = []) {
  const styles = Array.isArray(style) ? style : [style];
  setTimeout(() => {
    for (let i = 0, len = styles.length; i < len; i += 1) {
      styles[i].removeCss();
    }
  }, 0);
}
