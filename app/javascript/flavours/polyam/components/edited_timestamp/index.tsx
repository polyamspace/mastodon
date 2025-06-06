import { useCallback } from 'react';

import { FormattedMessage } from 'react-intl';

import type { Map as ImmutableMap, List as ImmutableList } from 'immutable';

import { fetchHistory } from 'flavours/polyam/actions/history';
import { openModal } from 'flavours/polyam/actions/modal';
import { Dropdown } from 'flavours/polyam/components/dropdown_menu';
import { FormattedDateWrapper } from 'flavours/polyam/components/formatted_date';
import InlineAccount from 'flavours/polyam/components/inline_account';
import { RelativeTimestamp } from 'flavours/polyam/components/relative_timestamp';
import { useAppDispatch, useAppSelector } from 'flavours/polyam/store';

type HistoryItem = ImmutableMap<string, unknown>;

export const EditedTimestamp: React.FC<{
  statusId: string;
  timestamp: string;
}> = ({ statusId, timestamp }) => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(
    (state) =>
      (
        state.history.getIn([statusId, 'items']) as
          | ImmutableList<unknown>
          | undefined
      )?.toArray() as HistoryItem[],
  );
  const loading = useAppSelector(
    (state) => state.history.getIn([statusId, 'loading']) as boolean,
  );

  const handleOpen = useCallback(() => {
    dispatch(fetchHistory(statusId));
  }, [dispatch, statusId]);

  const handleItemClick = useCallback(
    (_item: HistoryItem, index: number) => {
      dispatch(
        openModal({
          modalType: 'COMPARE_HISTORY',
          modalProps: { index, statusId },
        }),
      );
    },
    [dispatch, statusId],
  );

  const renderHeader = useCallback((items: HistoryItem[]) => {
    return (
      <FormattedMessage
        id='status.edited_x_times'
        defaultMessage='Edited {count, plural, one {# time} other {# times}}'
        values={{ count: items.length - 1 }}
      />
    );
  }, []);

  const renderItem = useCallback(
    (
      item: HistoryItem,
      index: number,
      {
        onClick,
        onKeyUp,
      }: {
        onClick: React.MouseEventHandler;
        onKeyUp: React.KeyboardEventHandler;
      },
    ) => {
      const formattedDate = (
        <RelativeTimestamp
          timestamp={item.get('created_at') as string}
          short={false}
        />
      );
      const formattedName = (
        <InlineAccount accountId={item.get('account') as string} />
      );

      const label = (item.get('original') as boolean) ? (
        <FormattedMessage
          id='status.history.created'
          defaultMessage='{name} created {date}'
          values={{ name: formattedName, date: formattedDate }}
        />
      ) : (
        <FormattedMessage
          id='status.history.edited'
          defaultMessage='{name} edited {date}'
          values={{ name: formattedName, date: formattedDate }}
        />
      );

      return (
        <li
          className='dropdown-menu__item edited-timestamp__history__item'
          key={item.get('created_at') as string}
        >
          <button data-index={index} onClick={onClick} onKeyUp={onKeyUp}>
            {label}
          </button>
        </li>
      );
    },
    [],
  );

  return (
    <Dropdown<HistoryItem>
      items={items}
      loading={loading}
      renderItem={renderItem}
      scrollable
      renderHeader={renderHeader}
      onOpen={handleOpen}
      onItemClick={handleItemClick}
      forceDropdown
    >
      <button className='dropdown-menu__text-button'>
        <FormattedMessage
          id='status.edited'
          defaultMessage='Edited {date}'
          values={{
            date: (
              <FormattedDateWrapper
                className='animated-number'
                value={timestamp}
                month='short'
                day='2-digit'
                hour='2-digit'
                minute='2-digit'
              />
            ),
          }}
        />
      </button>
    </Dropdown>
  );
};
