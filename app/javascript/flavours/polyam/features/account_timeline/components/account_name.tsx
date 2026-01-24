import type { FC } from 'react';

import { useIntl } from 'react-intl';

import InfoIcon from '@/awesome-icons/solid/circle-info.svg?react';
import LockIcon from '@/awesome-icons/solid/lock.svg?react';
import { DisplayName } from '@/flavours/polyam/components/display_name';
import { Icon } from '@/flavours/polyam/components/icon';
import { useAccount } from '@/flavours/polyam/hooks/useAccount';
import { useAppSelector } from '@/flavours/polyam/store';

import { DomainPill } from '../../account/components/domain_pill';
import { isRedesignEnabled } from '../common';

import classes from './redesign.module.scss';

export const AccountName: FC<{ accountId: string; className?: string }> = ({
  accountId,
  className,
}) => {
  const intl = useIntl();
  const account = useAccount(accountId);
  const me = useAppSelector((state) => state.meta.get('me') as string);
  const localDomain = useAppSelector(
    (state) => state.meta.get('domain') as string,
  );

  if (!account) {
    return null;
  }

  const [username = '', domain = localDomain] = account.acct.split('@');

  return (
    <h1 className={className}>
      <DisplayName account={account} variant='simple' />
      <small>
        <span>
          @{username}
          {isRedesignEnabled() && '@'}
          <span className='invisible'>
            {!isRedesignEnabled() && '@'}
            {domain}
          </span>
        </span>
        <DomainPill
          username={username}
          domain={domain}
          isSelf={me === account.id}
          className={(isRedesignEnabled() && classes.domainPill) || ''}
        >
          {isRedesignEnabled() && <Icon id='info' icon={InfoIcon} />}
        </DomainPill>
        {!isRedesignEnabled() && account.locked && (
          <Icon
            id='lock'
            icon={LockIcon}
            aria-label={intl.formatMessage({
              id: 'account.locked_info',
              defaultMessage:
                'This account privacy status is set to locked. The owner manually reviews who can follow them.',
            })}
          />
        )}
      </small>
    </h1>
  );
};
