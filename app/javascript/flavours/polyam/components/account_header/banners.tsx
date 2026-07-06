import { useCallback, useMemo } from 'react';
import type { FC, ReactElement, ReactNode } from 'react';

import { FormattedMessage } from 'react-intl';

import CheckIcon from '@/awesome-icons/solid/check.svg?react';
import CloseIcon from '@/awesome-icons/solid/xmark.svg?react';
import {
  authorizeFollowRequest,
  rejectFollowRequest,
} from '@/flavours/polyam/actions/accounts';
import { useAccountVisibility } from '@/flavours/polyam/hooks/useAccountVisibility';
import { useRelationship } from '@/flavours/polyam/hooks/useRelationship';
import type { Account } from '@/flavours/polyam/models/account';
import { useAppDispatch, useAppSelector } from '@/flavours/polyam/store';

import { AvatarOverlay } from '../avatar_overlay';
import { Button } from '../button';
import { DisplayName } from '../display_name';
import { Icon } from '../icon';
import { Permalink } from '../permalink';

import classes from './styles.module.scss';

export const AccountBanners: FC<{ account: Account }> = ({ account }) => {
  const { suspended, hidden } = useAccountVisibility(account.id);
  const relationship = useRelationship(account.id);

  // Polyam: Anniversary banner
  const createdAtStr = account.created_at;
  const anniversary = useMemo(() => {
    if (!createdAtStr) {
      return null;
    }
    const now = new Date();
    const createdAt = new Date(createdAtStr);
    if (
      now.getMonth() === createdAt.getMonth() &&
      now.getDate() === createdAt.getDate()
    ) {
      return now.getFullYear() - createdAt.getFullYear();
    }
    return null;
  }, [createdAtStr]);

  if (hidden) {
    return null;
  }

  let banner: ReactNode = null;

  if (account.memorial) {
    banner = (
      <MessageText>
        <FormattedMessage
          id='account.in_memoriam'
          defaultMessage='In Memoriam.'
        />
      </MessageText>
    );
  }

  if (account.moved) {
    banner = <MovedNote account={account} targetAccountId={account.moved} />;
  }

  if (!suspended && relationship?.requested_by) {
    banner = <FollowRequestNote account={account} />;
  }

  if (!account.memorial && !!anniversary) {
    <AnniversaryNote account={account} years={anniversary} />;
  }

  if (!banner) {
    return null;
  }

  return <div className={classes.bannerWrapper}>{banner}</div>;
};

const FollowRequestNote: FC<{ account: Account }> = ({ account }) => {
  const accountId = account.id;
  const dispatch = useAppDispatch();
  const handleAuthorize = useCallback(() => {
    dispatch(authorizeFollowRequest(accountId));
  }, [accountId, dispatch]);
  const handleReject = useCallback(() => {
    dispatch(rejectFollowRequest(accountId));
  }, [accountId, dispatch]);

  return (
    <>
      <MessageText>
        <FormattedMessage
          id='account.requested_follow'
          defaultMessage='{name} has requested to follow you'
          values={{ name: <DisplayName account={account} variant='simple' /> }}
        />
      </MessageText>

      <div className={classes.bannerActions}>
        <Button secondary onClick={handleAuthorize}>
          <Icon id='check' icon={CheckIcon} />
          <FormattedMessage
            id='follow_request.authorize'
            defaultMessage='Authorize'
          />
        </Button>

        <Button secondary onClick={handleReject}>
          <Icon id='times' icon={CloseIcon} />
          <FormattedMessage
            id='follow_request.reject'
            defaultMessage='Reject'
          />
        </Button>
      </div>
    </>
  );
};

const MovedNote: React.FC<{
  account: Account;
  targetAccountId: string;
}> = ({ account: from, targetAccountId }) => {
  const to = useAppSelector((state) => state.accounts.get(targetAccountId));

  return (
    <>
      <MessageText>
        <FormattedMessage
          id='account.moved_to'
          defaultMessage='{name} has indicated that their new account is now:'
          values={{
            name: <DisplayName account={from} variant='simple' />,
          }}
        />
      </MessageText>

      <div className={classes.bannerActions}>
        <Permalink
          to={`/@${to?.acct}`}
          href={to?.url}
          className={classes.bannerActionsDisplayName}
        >
          <div className='detailed-status__display-avatar'>
            <AvatarOverlay account={to} friend={from} />
          </div>
          <DisplayName account={to} />
        </Permalink>

        <Permalink to={`/@${to?.acct}`} href={to?.url} className='button'>
          <FormattedMessage
            id='account.go_to_profile'
            defaultMessage='Go to profile'
          />
        </Permalink>
      </div>
    </>
  );
};

const MessageText: React.FC<{ children: ReactElement }> = ({ children }) => (
  <div className={classes.bannerText}>{children}</div>
);

// Polyam

const Fedimation: React.FC = () => (
  <div className='fedimation' aria-hidden>
    <div className='fedi-logo' />
    <div className='fedi-logo' />
    <div className='fedi-logo' />
    <div className='fedi-logo' />
    <div className='fedi-logo' />
  </div>
);

export const AnniversaryNote: React.FC<{ account: Account; years: number }> = ({
  account,
  years,
}) => {
  return (
    <div className='account-anniversary-banner'>
      <Fedimation />

      <div className='account-anniversary-banner__message'>
        <FormattedMessage
          id='account.anniversary'
          //eslint-disable-next-line formatjs/blocklist-elements
          defaultMessage="It's {acct}'s {years, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} fediversary!"
          values={{
            acct: account.acct,
            years: years,
          }}
        />
      </div>
    </div>
  );
};
