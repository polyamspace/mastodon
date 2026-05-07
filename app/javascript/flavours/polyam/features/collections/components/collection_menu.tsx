import { useCallback, useMemo } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import MoreVertIcon from '@/awesome-icons/solid/ellipsis-vertical.svg?react';
import { showAlert } from '@/flavours/polyam/actions/alerts';
import { initBlockModal } from '@/flavours/polyam/actions/blocks';
import { useAccount } from '@/flavours/polyam/hooks/useAccount';
import { openModal } from 'flavours/polyam/actions/modal';
import type { ApiCollectionJSON } from 'flavours/polyam/api_types/collections';
import { Dropdown } from 'flavours/polyam/components/dropdown_menu';
import { IconButton } from 'flavours/polyam/components/icon_button';
import { me } from 'flavours/polyam/initial_state';
import type { MenuItem } from 'flavours/polyam/models/dropdown_menu';
import { useAppDispatch } from 'flavours/polyam/store';

import { messages as editorMessages } from '../editor';
import { getCollectionPath } from '../utils';

const messages = defineMessages({
  view: {
    id: 'collections.view_collection',
    defaultMessage: 'View collection',
  },
  share: {
    id: 'collections.share_short',
    defaultMessage: 'Share',
  },
  copyLink: {
    id: 'collections.copy_link',
    defaultMessage: 'Copy link',
  },
  copyLinkConfirmation: {
    id: 'collections.copy_link_confirmation',
    defaultMessage: 'Copied collection link to clipboard',
  },
  delete: {
    id: 'collections.delete_collection',
    defaultMessage: 'Delete collection',
  },
  report: {
    id: 'collections.report_collection',
    defaultMessage: 'Report this collection',
  },
  blockOwner: {
    id: 'collections.block_collection_owner',
    defaultMessage: 'Block account',
  },
  revoke: {
    id: 'collections.revoke_collection_inclusion',
    defaultMessage: 'Remove myself from this collection',
  },
  more: { id: 'status.more', defaultMessage: 'More' },
});

export const CollectionMenu: React.FC<{
  collection: ApiCollectionJSON;
  context: 'list' | 'notifications' | 'collection';
  className?: string;
}> = ({ collection, context, className }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { id, name, account_id, items } = collection;
  const ownerAccount = useAccount(account_id);
  const isOwnCollection = account_id === me;
  const currentAccountInCollection = items.find(
    (item) => item.account_id === me,
  );

  const openShareModal = useCallback(() => {
    dispatch(
      openModal({
        modalType: 'SHARE_COLLECTION',
        modalProps: {
          collection,
        },
      }),
    );
  }, [collection, dispatch]);

  const openDeleteConfirmation = useCallback(() => {
    dispatch(
      openModal({
        modalType: 'CONFIRM_DELETE_COLLECTION',
        modalProps: {
          name,
          id,
        },
      }),
    );
  }, [dispatch, id, name]);

  const openReportModal = useCallback(() => {
    dispatch(
      openModal({
        modalType: 'REPORT_COLLECTION',
        modalProps: {
          collection,
        },
      }),
    );
  }, [collection, dispatch]);

  const openBlockModal = useCallback(() => {
    dispatch(initBlockModal(ownerAccount));
  }, [ownerAccount, dispatch]);

  const openRevokeConfirmation = useCallback(() => {
    void dispatch(
      openModal({
        modalType: 'REVOKE_COLLECTION_INCLUSION',
        modalProps: {
          collectionId: collection.id,
          collectionItemId: currentAccountInCollection?.id,
        },
      }),
    );
  }, [collection.id, currentAccountInCollection?.id, dispatch]);

  const menu = useMemo(() => {
    const viewCollectionItem: MenuItem = {
      text: intl.formatMessage(messages.view),
      to: getCollectionPath(id),
    };
    const shareItems: MenuItem[] = [
      {
        text: intl.formatMessage(messages.share),
        action: openShareModal,
      },
      {
        text: intl.formatMessage(messages.copyLink),
        action: () => {
          void navigator.clipboard.writeText(collection.url);
          dispatch(showAlert({ message: messages.copyLinkConfirmation }));
        },
      },
    ];

    if (isOwnCollection) {
      const ownerItems: MenuItem[] = [
        ...shareItems,
        null,
        {
          text: intl.formatMessage(editorMessages.manageAccounts),
          to: `/collections/${id}/edit`,
        },
        {
          text: intl.formatMessage(editorMessages.editDetails),
          to: `/collections/${id}/edit/details`,
        },
        null,
        {
          text: intl.formatMessage(messages.delete),
          action: openDeleteConfirmation,
          dangerous: true,
        },
      ];

      if (context === 'list') {
        return [viewCollectionItem, ...ownerItems];
      } else {
        return ownerItems;
      }
    } else {
      const nonOwnerItems: MenuItem[] = [
        viewCollectionItem,
        ...shareItems,
        null,
      ];

      // Collection notifications already have a prominent 'Remove me' button
      if (currentAccountInCollection && context !== 'notifications') {
        nonOwnerItems.push({
          text: intl.formatMessage(messages.revoke),
          action: openRevokeConfirmation,
        });
      }

      nonOwnerItems.push({
        text: intl.formatMessage(messages.report),
        action: openReportModal,
      });

      if (currentAccountInCollection) {
        nonOwnerItems.push({
          text: intl.formatMessage(messages.blockOwner),
          action: openBlockModal,
        });
      }

      return nonOwnerItems;
    }
  }, [
    intl,
    id,
    openShareModal,
    isOwnCollection,
    collection.url,
    dispatch,
    openDeleteConfirmation,
    context,
    currentAccountInCollection,
    openReportModal,
    openRevokeConfirmation,
    openBlockModal,
  ]);

  return (
    <Dropdown scrollKey='collections' items={menu}>
      <IconButton
        icon='menu-icon'
        iconComponent={MoreVertIcon}
        title={intl.formatMessage(messages.more)}
        className={className}
      />
    </Dropdown>
  );
};
