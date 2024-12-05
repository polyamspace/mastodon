import type { ChangeEventHandler, KeyboardEventHandler } from 'react';
import { useCallback } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import classNames from 'classnames';

import CircleCloseIcon from '@/awesome-icons/solid/circle-xmark.svg?react';
import SearchIcon from '@/awesome-icons/solid/magnifying-glass.svg?react';
import {
  fetchPinnedAccountsSuggestions,
  clearPinnedAccountsSuggestions,
  changePinnedAccountsSuggestions,
} from 'flavours/polyam/actions/accounts';
import { Icon } from 'flavours/polyam/components/icon';
import { useAppDispatch, useAppSelector } from 'flavours/polyam/store';

const messages = defineMessages({
  search: {
    id: 'lists.search_placeholder',
    defaultMessage: 'Search people you follow',
  },
});

export const Search: React.FC = () => {
  const value = useAppSelector(
    (state) =>
      state.pinnedAccountsEditor.getIn(['suggestions', 'value']) as string,
  );
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const handleSubmit = useCallback<KeyboardEventHandler<HTMLInputElement>>(
    ({ currentTarget, key }) => {
      if (key === 'Enter')
        dispatch(fetchPinnedAccountsSuggestions(currentTarget.value));
    },
    [dispatch],
  );

  const handleClear = useCallback(() => {
    dispatch(clearPinnedAccountsSuggestions());
  }, [dispatch]);

  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ currentTarget }) => {
      dispatch(changePinnedAccountsSuggestions(currentTarget.value));
    },
    [dispatch],
  );

  const hasValue = value.length > 0;

  return (
    <div className='list-editor__search search'>
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
        onClick={handleClear}
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
