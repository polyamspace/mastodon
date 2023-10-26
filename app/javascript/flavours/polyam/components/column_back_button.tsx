import { useCallback } from 'react';

import { FormattedMessage } from 'react-intl';

import { Icon } from 'flavours/polyam/components/icon';
import { ButtonInTabsBar } from 'flavours/polyam/features/ui/util/columns_context';

import { useAppHistory } from './router';

type OnClickCallback = () => void;

function useHandleClick(onClick?: OnClickCallback) {
  const history = useAppHistory();

  return useCallback(() => {
    if (onClick) {
      onClick();
    } else if (history.location.state?.fromMastodon) {
      history.goBack();
    } else {
      history.push('/');
    }
  }, [history, onClick]);
}

export const ColumnBackButton: React.FC<{ onClick: OnClickCallback }> = ({
  onClick,
}) => {
  const handleClick = useHandleClick(onClick);

  const component = (
    <button onClick={handleClick} className='column-back-button'>
      <Icon id='chevron-left' className='column-back-button__icon' fixedWidth />
      <FormattedMessage id='column_back_button.label' defaultMessage='Back' />
    </button>
  );

  return <ButtonInTabsBar>{component}</ButtonInTabsBar>;
};

export const ColumnBackButtonSlim: React.FC<{ onClick: OnClickCallback }> = ({
  onClick,
}) => {
  const handleClick = useHandleClick(onClick);

  return (
    <div className='column-back-button--slim'>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
      <div
        role='button'
        tabIndex={0}
        onClick={handleClick}
        className='column-back-button column-back-button--slim-button'
      >
        <Icon
          id='chevron-left'
          className='column-back-button__icon'
          fixedWidth
        />
        <FormattedMessage id='column_back_button.label' defaultMessage='Back' />
      </div>
    </div>
  );
};
