import { useCallback, useState } from 'react';

import { useIntl, defineMessages } from 'react-intl';

import MoreHorizIcon from '@/awesome-icons/solid/ellipsis.svg?react';
import { Icon } from 'flavours/polyam/components/icon';
import { LoadingIndicator } from 'flavours/polyam/components/loading_indicator';

const messages = defineMessages({
  load_more: { id: 'status.load_more', defaultMessage: 'Load more' },
});

interface Props<T> {
  disabled: boolean;
  param: T;
  onClick: (params: T) => void;
}

export const LoadGap = <T,>({ disabled, param, onClick }: Props<T>) => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(() => {
    setLoading(true);
    onClick(param);
  }, [setLoading, param, onClick]);

  return (
    <button
      className='load-more load-gap'
      disabled={disabled}
      onClick={handleClick}
      aria-label={intl.formatMessage(messages.load_more)}
      title={intl.formatMessage(messages.load_more)}
    >
      {loading ? (
        <LoadingIndicator />
      ) : (
        <Icon id='ellipsis-h' icon={MoreHorizIcon} />
      )}
    </button>
  );
};
