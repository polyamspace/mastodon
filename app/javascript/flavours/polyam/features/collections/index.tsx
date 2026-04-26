import { useEffect } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import ListAltIcon from '@/awesome-icons/solid/list-ul.svg?react';
import AddIcon from '@/awesome-icons/solid/plus.svg?react';
import SquigglyArrow from '@/svg-icons/squiggly_arrow.svg?react';
import { Column } from 'flavours/polyam/components/column';
import { ColumnHeader } from 'flavours/polyam/components/column_header';
import { Icon } from 'flavours/polyam/components/icon';
import ScrollableList from 'flavours/polyam/components/scrollable_list';
import {
  fetchAccountCollections,
  selectAccountCollections,
} from 'flavours/polyam/reducers/slices/collections';
import { useAppSelector, useAppDispatch } from 'flavours/polyam/store';

import { CollectionListItem } from './detail/collection_list_item';
import { messages as editorMessages } from './editor';

const messages = defineMessages({
  heading: { id: 'column.collections', defaultMessage: 'My collections' },
});

export const Collections: React.FC<{
  multiColumn?: boolean;
}> = ({ multiColumn }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const me = useAppSelector((state) => state.meta.get('me') as string);
  const { collections, status } = useAppSelector((state) =>
    selectAccountCollections(state, me),
  );

  useEffect(() => {
    void dispatch(fetchAccountCollections({ accountId: me }));
  }, [dispatch, me]);

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
            title={intl.formatMessage(editorMessages.create)}
            aria-label={intl.formatMessage(editorMessages.create)}
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
          <CollectionListItem key={item.id} collection={item} />
        ))}
      </ScrollableList>

      <Helmet>
        <title>{intl.formatMessage(messages.heading)}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};
