/* eslint-disable react/no-unused-prop-types */
import React from 'react';
import { mountStyle, unmountStyle } from './helpers';

export default class Styled extends React.Component {

  static propTypes = {
    by: React.PropTypes.oneOfType([
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
    children: React.PropTypes.node,
  };

  static get defaultProps() {
    return {
      children: null,
    };
  }

  componentWillMount() {
    mountStyle(this.props.by);
  }

  componentWillUnmount() {
    unmountStyle(this.props.by);
  }

  render() {
    return this.props.children;
  }
}
