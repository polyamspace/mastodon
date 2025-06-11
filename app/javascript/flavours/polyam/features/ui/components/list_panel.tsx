import { useEffect, useState, useCallback, useId } from 'react';

import { useIntl, defineMessages } from 'react-intl';

import ArrowDropDownIcon from '@/awesome-icons/solid/caret-down.svg?react';
import ArrowLeftIcon from '@/awesome-icons/solid/caret-left.svg?react';
import ListAltIcon from '@/awesome-icons/solid/list-ul.svg?react';
import { fetchLists } from 'flavours/polyam/actions/lists';
import { IconButton } from 'flavours/polyam/components/icon_button';
import { getOrderedLists } from 'flavours/polyam/selectors/lists';
import { useAppDispatch, useAppSelector } from 'flavours/polyam/store';

import { ColumnLink } from './column_link';

const messages = defineMessages({
  lists: { id: 'navigation_bar.lists', defaultMessage: 'Lists' },
  expand: {
    id: 'navigation_panel.expand_lists',
    defaultMessage: 'Expand list menu',
  },
  collapse: {
    id: 'navigation_panel.collapse_lists',
    defaultMessage: 'Collapse list menu',
  },
});

export const ListPanel: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const lists = useAppSelector((state) => getOrderedLists(state));
  const [expanded, setExpanded] = useState(false);
  const accessibilityId = useId();

  useEffect(() => {
    dispatch(fetchLists());
  }, [dispatch]);

  const handleClick = useCallback(() => {
    setExpanded((value) => !value);
  }, [setExpanded]);

  return (
    <div className='navigation-panel__list-panel'>
      <div className='navigation-panel__list-panel__header'>
        <ColumnLink
          transparent
          to='/lists'
          icon='list-ul'
          iconComponent={ListAltIcon}
          text={intl.formatMessage(messages.lists)}
          id={`${accessibilityId}-title`}
        />

        {lists.length > 0 && (
          <IconButton
            icon='down'
            expanded={expanded}
            iconComponent={expanded ? ArrowDropDownIcon : ArrowLeftIcon}
            title={intl.formatMessage(
              expanded ? messages.collapse : messages.expand,
            )}
            onClick={handleClick}
            aria-controls={`${accessibilityId}-content`}
          />
        )}
      </div>

      {lists.length > 0 && expanded && (
        <div
          className='navigation-panel__list-panel__items'
          role='region'
          id={`${accessibilityId}-content`}
          aria-labelledby={`${accessibilityId}-title`}
        >
          {lists.map((list) => (
            <ColumnLink
              icon='list-ul'
              key={list.get('id')}
              iconComponent={ListAltIcon}
              text={list.get('title')}
              to={`/lists/${list.get('id')}`}
              transparent
            />
          ))}
        </div>
      )}
    </div>
  );
};
