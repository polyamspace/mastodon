import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { FormattedMessage } from 'react-intl';

import { connect } from 'react-redux';

import WindowRestoreIcon from '@/awesome-icons/solid/window-restore.svg?react';
import { removePictureInPicture } from 'flavours/polyam/actions/picture_in_picture';
import { Icon }  from 'flavours/polyam/components/icon';

class PictureInPicturePlaceholder extends PureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  handleClick = () => {
    const { dispatch } = this.props;
    dispatch(removePictureInPicture());
  };

  render () {
    return (
      <div className='picture-in-picture-placeholder' role='button' tabIndex={0} onClick={this.handleClick}>
        <Icon id='window-restore' icon={WindowRestoreIcon} />
        <FormattedMessage id='picture_in_picture.restore' defaultMessage='Put it back' />
      </div>
    );
  }

}

export default connect()(PictureInPicturePlaceholder);
