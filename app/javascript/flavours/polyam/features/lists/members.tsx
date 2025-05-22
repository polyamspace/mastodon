import { useCallback, useState, useEffect, useRef } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';

import { useDebouncedCallback } from 'use-debounce';

import AddIcon from '@/awesome-icons/solid/plus.svg?react';
import ListAltIcon from '@/awesome-icons/solid/rectangle-list.svg?react';
import RemoveIcon from '@/awesome-icons/solid/xmark.svg?react';
import SquigglyArrow from '@/svg-icons/squiggly_arrow.svg?react';
import { fetchRelationships } from 'flavours/polyam/actions/accounts';
import { showAlertForError } from 'flavours/polyam/actions/alerts';
import { importFetchedAccounts } from 'flavours/polyam/actions/importer';
import { fetchList } from 'flavours/polyam/actions/lists';
import { openModal } from 'flavours/polyam/actions/modal';
import { apiRequest } from 'flavours/polyam/api';
import { apiFollowAccount } from 'flavours/polyam/api/accounts';
import {
  apiGetAccounts,
  apiAddAccountToList,
  apiRemoveAccountFromList,
} from 'flavours/polyam/api/lists';
import type { ApiAccountJSON } from 'flavours/polyam/api_types/accounts';
import { Avatar } from 'flavours/polyam/components/avatar';
import { Column } from 'flavours/polyam/components/column';
import { ColumnHeader } from 'flavours/polyam/components/column_header';
import { ColumnSearchHeader } from 'flavours/polyam/components/column_search_header';
import { FollowersCounter } from 'flavours/polyam/components/counters';
import { DisplayName } from 'flavours/polyam/components/display_name';
import { IconButton } from 'flavours/polyam/components/icon_button';
import { Permalink } from 'flavours/polyam/components/permalink';
import ScrollableList from 'flavours/polyam/components/scrollable_list';
import { ShortNumber } from 'flavours/polyam/components/short_number';
import { VerifiedBadge } from 'flavours/polyam/components/verified_badge';
import { me } from 'flavours/polyam/initial_state';
import { useAppDispatch, useAppSelector } from 'flavours/polyam/store';

const messages = defineMessages({
  heading: { id: 'column.list_members', defaultMessage: 'Manage list members' },
  placeholder: {
    id: 'lists.search',
    defaultMessage: 'Search',
  },
  enterSearch: { id: 'lists.add_to_list', defaultMessage: 'Add to list' },
  add: { id: 'lists.add_member', defaultMessage: 'Add' },
  remove: { id: 'lists.remove_member', defaultMessage: 'Remove' },
  back: { id: 'column_back_button.label', defaultMessage: 'Back' },
});

type Mode = 'remove' | 'add';

const AccountItem: React.FC<{
  accountId: string;
  listId: string;
  partOfList: boolean;
  onToggle: (accountId: string) => void;
}> = ({ accountId, listId, partOfList, onToggle }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const account = useAppSelector((state) => state.accounts.get(accountId));
  const relationship = useAppSelector((state) =>
    accountId ? state.relationships.get(accountId) : undefined,
  );
  const following =
    accountId === me || relationship?.following || relationship?.requested;

  useEffect(() => {
    if (accountId) {
      dispatch(fetchRelationships([accountId]));
    }
  }, [dispatch, accountId]);

  const handleClick = useCallback(() => {
    if (partOfList) {
      void apiRemoveAccountFromList(listId, accountId);
      onToggle(accountId);
    } else {
      if (following) {
        void apiAddAccountToList(listId, accountId);
        onToggle(accountId);
      } else {
        dispatch(
          openModal({
            modalType: 'CONFIRM_FOLLOW_TO_LIST',
            modalProps: {
              accountId,
              onConfirm: () => {
                apiFollowAccount(accountId)
                  .then(() => apiAddAccountToList(listId, accountId))
                  .then(() => {
                    onToggle(accountId);
                    return '';
                  })
                  .catch((err: unknown) => {
                    dispatch(showAlertForError(err));
                  });
              },
            },
          }),
        );
      }
    }
  }, [dispatch, accountId, following, listId, partOfList, onToggle]);

  if (!account) {
    return null;
  }

  const firstVerifiedField = account.fields.find((item) => !!item.verified_at);

  return (
    <div className='account'>
      <div className='account__wrapper'>
        <Permalink
          key={account.id}
          className='account__display-name'
          title={account.acct}
          href={account.url}
          to={`/@${account.acct}`}
          data-hover-card-account={account.id}
        >
          <div className='account__avatar-wrapper'>
            <Avatar account={account} size={36} />
          </div>

          <div className='account__contents'>
            <DisplayName account={account} />

            {
              // @ts-expect-error -- Polyam: Don't show this.*/
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-binary-expression
              null && (
                <div className='account__details'>
                  <ShortNumber
                    value={account.followers_count}
                    renderer={FollowersCounter}
                  />{' '}
                  {firstVerifiedField && (
                    <VerifiedBadge link={firstVerifiedField.value} />
                  )}
                </div>
              )
            }
          </div>
        </Permalink>

        <div className='account__relationship'>
          {/* Polyam: IconButton instead of Button */}
          <IconButton
            title={intl.formatMessage(
              partOfList ? messages.remove : messages.add,
            )}
            icon={partOfList ? 'xmark' : 'plus'}
            iconComponent={partOfList ? RemoveIcon : AddIcon}
            onClick={handleClick}
          />
        </div>
      </div>
    </div>
  );
};

const ListMembers: React.FC<{
  multiColumn?: boolean;
}> = ({ multiColumn }) => {
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const intl = useIntl();

  const [searching, setSearching] = useState(false);
  const [accountIds, setAccountIds] = useState<string[]>([]);
  const [searchAccountIds, setSearchAccountIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('remove');

  useEffect(() => {
    if (id) {
      setLoading(true);
      dispatch(fetchList(id));

      void apiGetAccounts(id)
        .then((data) => {
          dispatch(importFetchedAccounts(data));
          setAccountIds(data.map((a) => a.id));
          setLoading(false);
          return '';
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [dispatch, id]);

  const handleSearchClick = useCallback(() => {
    setMode('add');
  }, [setMode]);

  const handleDismissSearchClick = useCallback(() => {
    setMode('remove');
    setSearching(false);
  }, [setMode]);

  const handleAccountToggle = useCallback(
    (accountId: string) => {
      const partOfList = accountIds.includes(accountId);

      if (partOfList) {
        setAccountIds(accountIds.filter((id) => id !== accountId));
      } else {
        setAccountIds([accountId, ...accountIds]);
      }
    },
    [accountIds, setAccountIds],
  );

  const searchRequestRef = useRef<AbortController | null>(null);

  const handleSearch = useDebouncedCallback(
    (value: string) => {
      if (searchRequestRef.current) {
        searchRequestRef.current.abort();
      }

      if (value.trim().length === 0) {
        setSearching(false);
        return;
      }

      setLoading(true);

      searchRequestRef.current = new AbortController();

      void apiRequest<ApiAccountJSON[]>('GET', 'v1/accounts/search', {
        signal: searchRequestRef.current.signal,
        params: {
          q: value,
          resolve: true,
        },
      })
        .then((data) => {
          dispatch(importFetchedAccounts(data));
          setSearchAccountIds(data.map((a) => a.id));
          setLoading(false);
          setSearching(true);
          return '';
        })
        .catch(() => {
          setSearching(true);
          setLoading(false);
        });
    },
    500,
    { leading: true, trailing: true },
  );

  let displayedAccountIds: string[];

  if (mode === 'add' && searching) {
    displayedAccountIds = searchAccountIds;
  } else {
    displayedAccountIds = accountIds;
  }

  return (
    <Column
      bindToDocument={!multiColumn}
      label={intl.formatMessage(messages.heading)}
    >
      <ColumnHeader
        title={intl.formatMessage(messages.heading)}
        icon='list-ul'
        iconComponent={ListAltIcon}
        multiColumn={multiColumn}
        showBackButton
      />

      <ColumnSearchHeader
        placeholder={intl.formatMessage(messages.placeholder)}
        onBack={handleDismissSearchClick}
        onSubmit={handleSearch}
        onActivate={handleSearchClick}
        active={mode === 'add'}
      />

      <ScrollableList
        scrollKey='list_members'
        trackScroll={!multiColumn}
        bindToDocument={!multiColumn}
        isLoading={loading}
        showLoading={loading && displayedAccountIds.length === 0}
        hasMore={false}
        footer={
          <>
            {displayedAccountIds.length > 0 && <div className='spacer' />}

            <div className='column-footer'>
              <Link to={`/lists/${id}`} className='button button--block'>
                <FormattedMessage id='lists.done' defaultMessage='Done' />
              </Link>
            </div>
          </>
        }
        emptyMessage={
          mode === 'remove' ? (
            <>
              <span>
                <FormattedMessage
                  id='lists.no_members_yet'
                  defaultMessage='No members yet.'
                />
                <br />
                <FormattedMessage
                  id='lists.find_users_to_add'
                  defaultMessage='Find users to add'
                />
              </span>

              <SquigglyArrow className='empty-column-indicator__arrow' />
            </>
          ) : (
            <FormattedMessage
              id='lists.no_results_found'
              defaultMessage='No results found.'
            />
          )
        }
      >
        {displayedAccountIds.map((accountId) => (
          <AccountItem
            key={accountId}
            accountId={accountId}
            listId={id}
            partOfList={
              displayedAccountIds === accountIds ||
              accountIds.includes(accountId)
            }
            onToggle={handleAccountToggle}
          />
        ))}
      </ScrollableList>

      <Helmet>
        <title>{intl.formatMessage(messages.heading)}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};

// eslint-disable-next-line import/no-default-export
export default ListMembers;
