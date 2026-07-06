import { FormattedMessage } from 'react-intl';

import classNames from 'classnames';

import CollectionsFilledIcon from '@/awesome-icons/solid/shapes.svg?react';
import { Button } from '@/flavours/polyam/components/button';
import { LinkedDisplayName } from '@/flavours/polyam/components/display_name';
import { Icon } from '@/flavours/polyam/components/icon';
import { CollectionMenu } from '@/flavours/polyam/features/collections/components/collection_menu';
import { CollectionPreviewCard } from '@/flavours/polyam/features/collections/components/collection_preview_card';
import { useConfirmRevoke } from '@/flavours/polyam/features/collections/detail/revoke_collection_inclusion_modal';
import { useAccount } from '@/flavours/polyam/hooks/useAccount';
import type {
  NotificationGroupAddedToCollection,
  NotificationGroupCollectionUpdate,
} from 'flavours/polyam/models/notification_group';

import classes from './notification_collection.module.scss';

export const NotificationCollection: React.FC<{
  notification:
    | NotificationGroupAddedToCollection
    | NotificationGroupCollectionUpdate;
  unread: boolean;
}> = ({ notification, unread }) => {
  const { collection, type } = notification;

  const collectionCreatorAccount = useAccount(collection?.account_id);
  const confirmRevoke = useConfirmRevoke(collection);

  if (!collection) {
    return null;
  }

  return (
    <div
      className={classNames(
        'notification-group',
        `notification-group--${type}`,
        { 'notification-group--unread': unread },
      )}
    >
      <div className='notification-group__icon'>
        <Icon id='collection' icon={CollectionsFilledIcon} />
      </div>

      <div className='notification-group__main'>
        <div className='notification-group__main__header'>
          <h2 className='notification-group__main__header__label'>
            {type === 'added_to_collection' && (
              <FormattedMessage
                id='notification.added_to_collection'
                defaultMessage='{name} added you to a collection'
                values={{
                  name: (
                    <LinkedDisplayName
                      displayProps={{
                        variant: 'simple',
                        account: collectionCreatorAccount,
                      }}
                    />
                  ),
                }}
              />
            )}
            {type === 'collection_update' && (
              <FormattedMessage
                id='notification.collection_update'
                defaultMessage='{name} edited a collection you’re in'
                values={{
                  name: (
                    <LinkedDisplayName
                      displayProps={{
                        variant: 'simple',
                        account: collectionCreatorAccount,
                      }}
                    />
                  ),
                }}
              />
            )}
          </h2>
        </div>

        <CollectionPreviewCard collection={collection} />

        <div className={classes.actions}>
          <Button
            compact
            secondary
            className='button--destructive'
            onClick={confirmRevoke}
          >
            <FormattedMessage
              id='collections.detail.revoke_inclusion'
              defaultMessage='Remove me'
            />
          </Button>

          <CollectionMenu
            context='notifications'
            collection={collection}
            className={classes.menuButton}
          />
        </div>
      </div>
    </div>
  );
};
