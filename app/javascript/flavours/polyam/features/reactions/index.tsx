import { useCallback, useEffect } from 'react';

import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { Helmet } from 'react-helmet';

import type { List as ImmutableList } from 'immutable';

import ReactIcon from '@/awesome-icons/solid/face-grin-wide.svg?react';
import RefreshIcon from '@/awesome-icons/solid/rotate-left.svg?react';
import { fetchReactions } from 'flavours/polyam/actions/interactions_typed';
import { Account } from 'flavours/polyam/components/account';
import { ColumnHeader } from 'flavours/polyam/components/column_header';
import { Icon } from 'flavours/polyam/components/icon';
import { LoadingIndicator } from 'flavours/polyam/components/loading_indicator';
import ScrollableList from 'flavours/polyam/components/scrollable_list';
import { useAppDispatch, useAppSelector } from 'flavours/polyam/store';

import Column from '../ui/components/column';

const messages = defineMessages({
  heading: { id: 'column.reacted_by', defaultMessage: 'Reacted by' },
  refresh: { id: 'refresh', defaultMessage: 'Refresh' },
});

export const Reactions: React.FC<{
  multiColumn?: boolean;
  params?: { statusId: string };
}> = ({ multiColumn, params }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const statusId = params?.statusId;

  const accountIds = useAppSelector(
    (state) =>
      state.user_lists.getIn(['reacted_by', statusId, 'items']) as
        | ImmutableList<string>
        | undefined,
  );
  const nextUrl = useAppSelector(
    (state) =>
      state.user_lists.getIn(['reacted_by', statusId, 'next']) as
        | string
        | undefined,
  );
  const isLoading = useAppSelector((state) =>
    state.user_lists.getIn(['reacted_by', statusId, 'isLoading'], true),
  );
  const hasMore = !!nextUrl;

  useEffect(() => {
    if (statusId) void dispatch(fetchReactions({ statusId }));
  }, [dispatch, statusId]);

  const handleLoadMore = useCallback(() => {
    if (statusId && nextUrl)
      void dispatch(fetchReactions({ statusId, next: nextUrl }));
  }, [dispatch, statusId, nextUrl]);

  const handleRefresh = useCallback(() => {
    if (statusId) void dispatch(fetchReactions({ statusId }));
  }, [dispatch, statusId]);

  if (!accountIds) {
    return (
      <Column>
        <LoadingIndicator />
      </Column>
    );
  }

  const emptyMessage = (
    <FormattedMessage
      id='status.reactions.empty'
      defaultMessage='No one has reacted to this toot yet. When someone does, they will show up here.'
    />
  );

  return (
    <Column bindToDocument={multiColumn}>
      <ColumnHeader
        icon='face-grin-wide'
        iconComponent={ReactIcon}
        title={intl.formatMessage(messages.heading)}
        showBackButton
        multiColumn={multiColumn}
        extraButton={
          <button
            type='button'
            className='column-header__button'
            title={intl.formatMessage(messages.refresh)}
            aria-label={intl.formatMessage(messages.refresh)}
            onClick={handleRefresh}
          >
            <Icon id='refresh' icon={RefreshIcon} />
          </button>
        }
      />

      <ScrollableList
        scrollKey='reactions'
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        bindToDocument={!multiColumn}
      >
        {accountIds.map((id) => (
          <Account key={id} id={id} />
        ))}
      </ScrollableList>

      <Helmet>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};

// eslint-disable-next-line import/no-default-export
export default Reactions;
