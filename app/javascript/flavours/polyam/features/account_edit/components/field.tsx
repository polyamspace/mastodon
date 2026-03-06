import type { FC } from 'react';

import { EmojiHTML } from '@/flavours/polyam/components/emoji/html';
import type { useElementHandledLink } from '@/flavours/polyam/components/status/handled_link';
import type { FieldData } from '@/flavours/polyam/reducers/slices/profile_edit';

import classes from '../styles.module.scss';

export const AccountField: FC<
  FieldData & Partial<ReturnType<typeof useElementHandledLink>>
> = ({ onElement, ...field }) => {
  return (
    <>
      <EmojiHTML
        as='h2'
        htmlString={field.name}
        className={classes.fieldName}
        onElement={onElement}
      />

      <EmojiHTML
        as='p'
        htmlString={field.value}
        className={classes.fieldValue}
        onElement={onElement}
      />
    </>
  );
};
