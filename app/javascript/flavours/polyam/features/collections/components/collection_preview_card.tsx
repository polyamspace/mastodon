import { useIntl } from 'react-intl';

import classNames from 'classnames';

import CloseIcon from '@/awesome-icons/solid/xmark.svg?react';
import { IconButton } from 'flavours/polyam/components/icon_button';
import type { CollectionLockupProps } from 'flavours/polyam/features/collections/components/collection_lockup';
import { CollectionLockup } from 'flavours/polyam/features/collections/components/collection_lockup';

import classes from './collection_preview_card.module.scss';

interface CollectionPreviewCardProps extends CollectionLockupProps {
  onRemove?: () => void;
}

export const CollectionPreviewCard: React.FC<CollectionPreviewCardProps> = ({
  collection,
  onRemove,
  ...otherProps
}) => {
  const intl = useIntl();
  const removeButton = onRemove && (
    <IconButton
      icon='remove'
      iconComponent={CloseIcon}
      onClick={onRemove}
      title={intl.formatMessage({
        id: 'tag.remove',
        defaultMessage: 'Remove',
      })}
      className={classes.removeButton}
    />
  );

  return (
    <CollectionLockup
      collection={collection}
      className={classNames(classes.wrapper, 'collection-preview')}
      sideContent={removeButton}
      {...otherProps}
    />
  );
};
