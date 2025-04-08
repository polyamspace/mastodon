import { useEffect, useRef, useCallback } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';

import StarIcon from '@/awesome-icons/solid/star.svg?react';
import {
  addColumn,
  removeColumn,
  moveColumn,
} from 'flavours/polyam/actions/columns';
import {
  fetchFavouritedStatuses,
  expandFavouritedStatuses,
} from 'flavours/polyam/actions/favourites';
import { Column } from 'flavours/polyam/components/column';
import type { ColumnRef } from 'flavours/polyam/components/column';
import { ColumnHeader } from 'flavours/polyam/components/column_header';
import StatusList from 'flavours/polyam/components/status_list';
import { getStatusList } from 'flavours/polyam/selectors';
import { useAppDispatch, useAppSelector } from 'flavours/polyam/store';

const messages = defineMessages({
  heading: { id: 'column.favourites', defaultMessage: 'Favorites' },
});

const Favourites: React.FC<{ columnId: string; multiColumn: boolean }> = ({
  columnId,
  multiColumn,
}) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const columnRef = useRef<ColumnRef>(null);
  const statusIds = useAppSelector((state) =>
    getStatusList(state, 'favourites'),
  );
  const isLoading = useAppSelector(
    (state) =>
      state.status_lists.getIn(['favourites', 'isLoading'], true) as boolean,
  );
  const hasMore = useAppSelector(
    (state) => !!state.status_lists.getIn(['favourites', 'next']),
  );

  useEffect(() => {
    dispatch(fetchFavouritedStatuses());
  }, [dispatch]);

  const handlePin = useCallback(() => {
    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn('FAVOURITES', {}));
    }
  }, [dispatch, columnId]);

  const handleMove = useCallback(
    (dir: number) => {
      dispatch(moveColumn(columnId, dir));
    },
    [dispatch, columnId],
  );

  const handleHeaderClick = useCallback(() => {
    columnRef.current?.scrollTop();
  }, []);

  const handleLoadMore = useCallback(() => {
    dispatch(expandFavouritedStatuses());
  }, [dispatch]);

  const pinned = !!columnId;

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.favourited_statuses'
      defaultMessage="You don't have any favorite posts yet. When you favorite one, it will show up here."
    />
  );

  return (
    <Column
      bindToDocument={!multiColumn}
      ref={columnRef}
      label={intl.formatMessage(messages.heading)}
    >
      <ColumnHeader
        icon='star'
        iconComponent={StarIcon}
        title={intl.formatMessage(messages.heading)}
        onPin={handlePin}
        onMove={handleMove}
        onClick={handleHeaderClick}
        pinned={pinned}
        multiColumn={multiColumn}
      />

      <StatusList
        trackScroll={!pinned}
        statusIds={statusIds}
        scrollKey={`favourited_statuses-${columnId}`}
        hasMore={hasMore}
        isLoading={isLoading}
        onLoadMore={handleLoadMore}
        emptyMessage={emptyMessage}
        bindToDocument={!multiColumn}
        timelineId='favourites'
      />

      <Helmet>
        <title>{intl.formatMessage(messages.heading)}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};

// eslint-disable-next-line import/no-default-export
export default Favourites;
