import { useEffect, useRef, useCallback } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';

import BookmarksIcon from '@/awesome-icons/solid/bookmark.svg?react';
import {
  fetchBookmarkedStatuses,
  expandBookmarkedStatuses,
} from 'flavours/polyam/actions/bookmarks';
import {
  addColumn,
  removeColumn,
  moveColumn,
} from 'flavours/polyam/actions/columns';
import { Column } from 'flavours/polyam/components/column';
import type { ColumnRef } from 'flavours/polyam/components/column';
import { ColumnHeader } from 'flavours/polyam/components/column_header';
import StatusList from 'flavours/polyam/components/status_list';
import { getStatusList } from 'flavours/polyam/selectors';
import { useAppDispatch, useAppSelector } from 'flavours/polyam/store';

const messages = defineMessages({
  heading: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
});

const Bookmarks: React.FC<{
  columnId: string;
  multiColumn: boolean;
}> = ({ columnId, multiColumn }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const columnRef = useRef<ColumnRef>(null);
  const statusIds = useAppSelector((state) =>
    getStatusList(state, 'bookmarks'),
  );
  const isLoading = useAppSelector(
    (state) =>
      state.status_lists.getIn(['bookmarks', 'isLoading'], true) as boolean,
  );
  const hasMore = useAppSelector(
    (state) => !!state.status_lists.getIn(['bookmarks', 'next']),
  );

  useEffect(() => {
    dispatch(fetchBookmarkedStatuses());
  }, [dispatch]);

  const handlePin = useCallback(() => {
    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn('BOOKMARKS', {}));
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
    dispatch(expandBookmarkedStatuses());
  }, [dispatch]);

  const pinned = !!columnId;

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.bookmarked_statuses'
      defaultMessage="You don't have any bookmarked posts yet. When you bookmark one, it will show up here."
    />
  );

  return (
    <Column
      bindToDocument={!multiColumn}
      ref={columnRef}
      label={intl.formatMessage(messages.heading)}
    >
      <ColumnHeader
        icon='bookmarks'
        iconComponent={BookmarksIcon}
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
        scrollKey={`bookmarked_statuses-${columnId}`}
        hasMore={hasMore}
        isLoading={isLoading}
        onLoadMore={handleLoadMore}
        emptyMessage={emptyMessage}
        bindToDocument={!multiColumn}
        timelineId='bookmarks'
      />

      <Helmet>
        <title>{intl.formatMessage(messages.heading)}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};

// eslint-disable-next-line import/no-default-export
export default Bookmarks;
