import PropTypes from 'prop-types';
import { useCallback } from 'react';

import { FormattedMessage } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';

import { Button } from 'flavours/polyam/components/button';

export const AltTextModal = ({ media, onClose}) => {
  const handleClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div className='modal-root__modal alttext-modal'>
      <div className='alttext-modal__top'>
        <div className='alttext-modal__description'>
          <pre>{media.getIn(['translation', 'description']) || media.get('description')}</pre>
        </div>
      </div>
      <div className='alttext-modal__bottom'>
        <div className='alttext-modal__actions'>
          <Button onClick={handleClick}>
            <FormattedMessage id='lightbox.close' defaultMessage='Close' />
          </Button>
        </div>
      </div>
    </div>
  );
};

AltTextModal.propTypes = {
  media: ImmutablePropTypes.map.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AltTextModal;
