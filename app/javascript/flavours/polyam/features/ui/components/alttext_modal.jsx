import PropTypes from 'prop-types';

import { injectIntl, FormattedMessage } from 'react-intl';

import { withRouter } from 'react-router';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

import { Button } from 'flavours/polyam/components/button';
import { WithRouterPropTypes } from 'flavours/polyam/utils/react_router';

class AltTextModal extends ImmutablePureComponent {

  static propTypes = {
    media: ImmutablePropTypes.map.isRequired,
    statusId: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    ...WithRouterPropTypes,
  };

  render () {
    const { media, onClose } = this.props;

    return (
      <div className='modal-root__modal alttext-modal'>
        <div className='alttext-modal__container'>
          <pre>{media.get('description')}</pre>
        </div>
        <div className='alttext-modal__action-bar'>
          <Button onClick={onClose} className='alttext-modal__button'>
            <FormattedMessage id='lightbox.close' defaultMessage='Close' />
          </Button>
        </div>
      </div>
    );
  }

}

export default withRouter(injectIntl(AltTextModal));
