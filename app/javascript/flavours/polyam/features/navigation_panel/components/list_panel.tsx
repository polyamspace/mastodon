import { useEffect, useState } from 'react';

import { useIntl, defineMessages } from 'react-intl';

import ListAltIcon from '@/awesome-icons/solid/list-ul.svg?react';
import { fetchLists } from 'flavours/polyam/actions/lists';
import { ColumnLink } from 'flavours/polyam/features/ui/components/column_link';
import { getOrderedLists } from 'flavours/polyam/selectors/lists';
import { useAppDispatch, useAppSelector } from 'flavours/polyam/store';

import { CollapsiblePanel } from './collapsible_panel';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    void dispatch(fetchLists()).then(() => {
      setLoading(false);

      return '';
    });
  }, [dispatch, setLoading]);

  return (
    <CollapsiblePanel
      to='/lists'
      icon='list-ul'
      iconComponent={ListAltIcon}
      title={intl.formatMessage(messages.lists)}
      collapseTitle={intl.formatMessage(messages.collapse)}
      expandTitle={intl.formatMessage(messages.expand)}
      loading={loading}
    >
      {lists.map((list) => (
        <ColumnLink
          icon='list-ul'
          key={list.id}
          iconComponent={ListAltIcon}
          text={list.title}
          to={`/lists/${list.id}`}
          transparent
        />
      ))}
    </CollapsiblePanel>
  );
};
