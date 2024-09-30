import { useCallback } from 'react';

import { FormattedMessage } from 'react-intl';

import { Button } from 'flavours/polyam/components/button';

export const AltTextModal: React.FC<{
  description: string;
  onClose: () => void;
}> = ({ description, onClose }) => {
  const handleClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div className='modal-root__modal alttext-modal'>
      <div className='alttext-modal__top'>
        <div className='alttext-modal__description'>
          <pre>{description}</pre>
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
