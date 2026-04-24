import { useEffect, useMemo, useCallback } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import MoreHorizIcon from '@/awesome-icons/solid/ellipsis.svg?react';
import ListAltIcon from '@/awesome-icons/solid/list-ul.svg?react';
import AddIcon from '@/awesome-icons/solid/plus.svg?react';
import SquigglyArrow from '@/svg-icons/squiggly_arrow.svg?react';
import { openModal } from 'flavours/polyam/actions/modal';
import { Column } from 'flavours/polyam/components/column';
import { ColumnHeader } from 'flavours/polyam/components/column_header';
import { Dropdown } from 'flavours/polyam/components/dropdown_menu';
import { Icon } from 'flavours/polyam/components/icon';
import ScrollableList from 'flavours/polyam/components/scrollable_list';
import {
  createCollection,
  fetchAccountCollections,
  selectMyCollections,
} from 'flavours/polyam/reducers/slices/collections';
import { useAppSelector, useAppDispatch } from 'flavours/polyam/store';

const messages = defineMessages({
  heading: { id: 'column.collections', defaultMessage: 'My collections' },
  create: {
    id: 'collections.create_collection',
    defaultMessage: 'Create collection',
  },
  view: {
    id: 'collections.view_collection',
    defaultMessage: 'View collection',
  },
  delete: {
    id: 'collections.delete_collection',
    defaultMessage: 'Delete collection',
  },
  more: { id: 'status.more', defaultMessage: 'More' },
});

const ListItem: React.FC<{
  id: string;
  name: string;
}> = ({ id, name }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const handleDeleteClick = useCallback(() => {
    dispatch(
      openModal({
        modalType: 'CONFIRM_DELETE_LIST',
        modalProps: {
          listId: id,
        },
      }),
    );
  }, [dispatch, id]);

  const menu = useMemo(
    () => [
      { text: intl.formatMessage(messages.view), to: `/collections/${id}` },
      { text: intl.formatMessage(messages.delete), action: handleDeleteClick },
    ],
    [intl, id, handleDeleteClick],
  );

  return (
    <div className='lists__item'>
      <Link to={`/collections/${id}`} className='lists__item__title'>
        <span>{name}</span>
      </Link>

      <Dropdown
        scrollKey='collections'
        items={menu}
        icon='ellipsis-h'
        iconComponent={MoreHorizIcon}
        title={intl.formatMessage(messages.more)}
      />
    </div>
  );
};

export const Collections: React.FC<{
  multiColumn?: boolean;
}> = ({ multiColumn }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const me = useAppSelector((state) => state.meta.get('me') as string);
  const { collections, status } = useAppSelector(selectMyCollections);

  useEffect(() => {
    void dispatch(fetchAccountCollections({ accountId: me }));
  }, [dispatch, me]);

  const addDummyCollection = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();

      void dispatch(
        createCollection({
          payload: {
            name: 'Test Collection',
            description: 'A useful test collection',
            discoverable: true,
            sensitive: false,
          },
        }),
      );
    },
    [dispatch],
  );

  const emptyMessage =
    status === 'error' ? (
      <FormattedMessage
        id='collections.error_loading_collections'
        defaultMessage='There was an error when trying to load your collections.'
      />
    ) : (
      <>
        <span>
          <FormattedMessage
            id='collections.no_collections_yet'
            defaultMessage='No collections yet.'
          />
          <br />
          <FormattedMessage
            id='collections.create_a_collection_hint'
            defaultMessage='Create a collection to recommend or share your favourite accounts with others.'
          />
        </span>

        <SquigglyArrow className='empty-column-indicator__arrow' />
      </>
    );

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
        extraButton={
          <Link
            to='/collections/new'
            className='column-header__button'
            title={intl.formatMessage(messages.create)}
            aria-label={intl.formatMessage(messages.create)}
            onClick={addDummyCollection}
          >
            <Icon id='plus' icon={AddIcon} />
          </Link>
        }
      />

      <ScrollableList
        scrollKey='collections'
        emptyMessage={emptyMessage}
        isLoading={status === 'loading'}
        bindToDocument={!multiColumn}
      >
        {collections.map((item) => (
          <ListItem key={item.id} id={item.id} name={item.name} />
        ))}
      </ScrollableList>

      <Helmet>
        <title>{intl.formatMessage(messages.heading)}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};
