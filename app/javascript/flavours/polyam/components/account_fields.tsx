import classNames from 'classnames';

import CheckIcon from '@/awesome-icons/solid/check.svg?react';
import { Icon } from 'flavours/polyam/components/icon';
import { useLinks } from 'flavours/polyam/hooks/useLinks';
import type { Account } from 'flavours/polyam/models/account';

export const AccountFields: React.FC<{
  fields: Account['fields'];
  limit: number;
}> = ({ fields, limit = -1 }) => {
  const handleClick = useLinks();

  if (fields.size === 0) {
    return null;
  }

  return (
    <div className='account-fields' onClickCapture={handleClick}>
      {fields.take(limit).map((pair, i) => (
        <dl
          key={i}
          className={classNames({ verified: pair.get('verified_at') })}
        >
          <dt
            dangerouslySetInnerHTML={{ __html: pair.get('name_emojified') }}
            className='translate'
          />

          <dd className='translate' title={pair.get('value_plain') ?? ''}>
            {pair.get('verified_at') && (
              <Icon id='check' icon={CheckIcon} className='verified__mark' />
            )}
            <span
              dangerouslySetInnerHTML={{ __html: pair.get('value_emojified') }}
            />
          </dd>
        </dl>
      ))}
    </div>
  );
};
