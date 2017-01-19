/* eslint-disable react/no-unused-prop-types */
import React from 'react';
import { mountStyle, unmountStyle } from './helpers';

export default class Style extends React.Component {

  static propTypes = {
    children: React.PropTypes.node,
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

  static get defaultProps() {
    return {
      children: null,
    };
  }

  componentWillMount() {
    mountStyle(this.props.style);
  }

  componentWillUnmount() {
    unmountStyle(this.props.style);
  }

  render() {
    return this.props.children;
  }
}
