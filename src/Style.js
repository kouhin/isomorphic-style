/* eslint-disable react/no-unused-prop-types */
import React from 'react';

class Style extends React.Component {

  constructor(props) {
    super(props);
    this.styles = Array.isArray(props.style) ? props.style : [props.style];
  }

  componentWillMount() {
    for (let i = 0, len = this.styles.length; i < len; i += 1) {
      this.styles[i].insertCss();
    }
  }

  componentWillUnmount() {
    setTimeout(() => {
      for (let i = 0, len = this.styles.length; i < len; i += 1) {
        this.styles[i].removeCss();
      }
    }, 0);
  }

  render() {
    return null;
  }
}

Style.propTypes = {
  style: React.PropTypes.oneOfType([
    React.PropTypes.arrayOf(
      React.PropTypes.shape({
        insertCss: React.PropTypes.func.isRequired,
        removeCss: React.PropTypes.func.isRequired,
      }),
    ),
    React.PropTypes.shape({
      insertCss: React.PropTypes.func.isRequired,
      removeCss: React.PropTypes.func.isRequired,
    }),
  ]),
};

export default Style;
