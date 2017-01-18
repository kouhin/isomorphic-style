/* eslint-disable react/no-unused-prop-types */
import React from 'react';
import { mountStyle, unmountStyle } from './helpers';

class Style extends React.Component {

  componentWillMount() {
    mountStyle(this.props.style);
  }

  componentWillUnmount() {
    unmountStyle(this.props.style);
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
