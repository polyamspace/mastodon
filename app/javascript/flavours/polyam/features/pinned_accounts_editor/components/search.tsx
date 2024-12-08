import { useCallback, useState } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import classNames from 'classnames';

import CircleCloseIcon from '@/awesome-icons/solid/circle-xmark.svg?react';
import SearchIcon from '@/awesome-icons/solid/magnifying-glass.svg?react';
import { Icon } from 'flavours/polyam/components/icon';

const messages = defineMessages({
  search: {
    id: 'lists.search_placeholder',
    defaultMessage: 'Search people you follow',
  },
});

export const Search: React.FC<{
  onBack: () => void;
  onSubmit: (value: string) => void;
}> = ({ onBack, onSubmit }) => {
  const intl = useIntl();

  const [value, setValue] = useState('');

  const handleSubmit = useCallback(() => {
    onSubmit(value);
  }, [onSubmit, value]);

  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    ({ currentTarget }) => {
      setValue(currentTarget.value);
    },
    [],
  );

  const hasValue = value.length > 0;

  return (
    <div className='pinned-accounts-editor__search search'>
      <label>
        <span style={{ display: 'none' }}>
          {intl.formatMessage(messages.search)}
        </span>

        <input
          className='search__input'
          type='text'
          value={value}
          onChange={handleChange}
          onKeyUp={handleSubmit}
          placeholder={intl.formatMessage(messages.search)}
        />
      </label>

      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
      <div
        role='button'
        tabIndex={0}
        className='search__icon'
        onClick={handleBack}
      >
        <Icon
          id='search'
          icon={SearchIcon}
          className={classNames({ active: !hasValue })}
        />
        <Icon
          id='times-circle'
          icon={CircleCloseIcon}
          aria-label={intl.formatMessage(messages.search)}
          className={classNames({ active: hasValue })}
        />
      </div>
    </div>
  );
};
