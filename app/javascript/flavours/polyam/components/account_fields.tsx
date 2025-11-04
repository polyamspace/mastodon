import { useIntl } from 'react-intl';

import classNames from 'classnames';

import CheckIcon from '@/awesome-icons/solid/check.svg?react';
import { Icon } from 'flavours/polyam/components/icon';
import type { Account } from 'flavours/polyam/models/account';

import { CustomEmojiProvider } from './emoji/context';
import { EmojiHTML } from './emoji/html';
import { useElementHandledLink } from './status/handled_link';

export const AccountFields: React.FC<Pick<Account, 'fields' | 'emojis'>> = ({
  fields,
  emojis,
}) => {
  const intl = useIntl();
  const htmlHandlers = useElementHandledLink();

  if (fields.size === 0) {
    return null;
  }

  return (
    <CustomEmojiProvider emojis={emojis}>
      {fields.map((pair, i) => (
        <dl key={i} className={classNames({ verified: pair.verified_at })}>
          <EmojiHTML
            as='dt'
            htmlString={pair.name_emojified}
            className='translate'
            {...htmlHandlers}
          />

          <dd className='translate' title={pair.value_plain ?? ''}>
            {pair.verified_at && (
              <span
                title={intl.formatMessage(
                  {
                    id: 'account.link_verified_on',
                    defaultMessage:
                      'Ownership of this link was checked on {date}',
                  },
                  {
                    date: intl.formatDate(pair.verified_at, dateFormatOptions),
                  },
                )}
              >
                <Icon id='check' icon={CheckIcon} className='verified__mark' />
              </span>
            )}{' '}
            <EmojiHTML
              as='span'
              htmlString={pair.value_emojified}
              {...htmlHandlers}
            />
          </dd>
        </dl>
      ))}
    </CustomEmojiProvider>
  );
};

const dateFormatOptions: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};
