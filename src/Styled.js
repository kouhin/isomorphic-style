/* eslint-disable react/no-unused-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { mountStyle, unmountStyle } from './helpers';

export default class Styled extends React.Component {

  static propTypes = {
    by: PropTypes.oneOfType([
      PropTypes.arrayOf(
        PropTypes.shape({
          insertCss: PropTypes.func.isRequired,
          removeCss: PropTypes.func.isRequired,
        }),
      ),
      PropTypes.shape({
        insertCss: PropTypes.func.isRequired,
        removeCss: PropTypes.func.isRequired,
      }),
    ]),
    children: PropTypes.node,
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
