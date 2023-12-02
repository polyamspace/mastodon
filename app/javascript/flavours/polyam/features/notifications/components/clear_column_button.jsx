import PropTypes from 'prop-types';
import { Component } from 'react';

import { FormattedMessage } from 'react-intl';

import { faEraser } from '@fortawesome/free-solid-svg-icons';

import { Icon }  from 'flavours/polyam/components/icon';

export default class ClearColumnButton extends Component {

  static propTypes = {
    onClick: PropTypes.func.isRequired,
  };

  render () {
    return (
      <button className='text-btn column-header__setting-btn' tabIndex={0} onClick={this.props.onClick}><Icon id='eraser' icon={faEraser} /> <FormattedMessage id='notifications.clear' defaultMessage='Clear notifications' /></button>
    );
  }

}
