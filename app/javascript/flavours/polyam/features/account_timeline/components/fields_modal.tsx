import type { FC } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';

import CloseIcon from '@/awesome-icons/solid/xmark.svg?react';
import { DisplayName } from '@/flavours/polyam/components/display_name';
import { AnimateEmojiProvider } from '@/flavours/polyam/components/emoji/context';
import { EmojiHTML } from '@/flavours/polyam/components/emoji/html';
import { IconButton } from '@/flavours/polyam/components/icon_button';
import { LoadingIndicator } from '@/flavours/polyam/components/loading_indicator';
import { useElementHandledLink } from '@/flavours/polyam/components/status/handled_link';
import { useAccount } from '@/flavours/polyam/hooks/useAccount';

import classes from './redesign.module.scss';

export const AccountFieldsModal: FC<{
  accountId: string;
  onClose: () => void;
}> = ({ accountId, onClose }) => {
  const intl = useIntl();
  const account = useAccount(accountId);
  const htmlHandlers = useElementHandledLink();

  if (!account) {
    return (
      <div className='modal-root__modal dialog-modal'>
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className='modal-root__modal dialog-modal'>
      <div className='dialog-modal__header'>
        <IconButton
          icon='close'
          className={classes.modalCloseButton}
          onClick={onClose}
          iconComponent={CloseIcon}
          title={intl.formatMessage({
            id: 'account_fields_modal.close',
            defaultMessage: 'Close',
          })}
        />
        <span className={`${classes.modalTitle} dialog-modal__header__title`}>
          <FormattedMessage
            id='account_fields_modal.title'
            defaultMessage="{name}'s info"
            values={{
              name: <DisplayName account={account} variant='simple' />,
            }}
          />
        </span>
      </div>
      <div className='dialog-modal__content'>
        <AnimateEmojiProvider>
          <dl className={classes.modalFieldsList}>
            {account.fields.map((field, index) => (
              <div key={index} className={classes.modalFieldItem}>
                <EmojiHTML
                  as='dt'
                  htmlString={field.name_emojified}
                  extraEmojis={account.emojis}
                  className='translate'
                  {...htmlHandlers}
                />
                <EmojiHTML
                  as='dd'
                  htmlString={field.value_emojified}
                  extraEmojis={account.emojis}
                  {...htmlHandlers}
                />
              </div>
            ))}
          </dl>
        </AnimateEmojiProvider>
      </div>
    </div>
  );
};
