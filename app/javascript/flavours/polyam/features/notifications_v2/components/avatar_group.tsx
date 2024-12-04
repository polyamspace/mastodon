import { Avatar } from 'flavours/polyam/components/avatar';
import { Permalink } from 'flavours/polyam/components/permalink';
import { NOTIFICATIONS_GROUP_MAX_AVATARS } from 'flavours/polyam/models/notification_group';
import { useAppSelector } from 'flavours/polyam/store';

const AvatarWrapper: React.FC<{ accountId: string }> = ({ accountId }) => {
  const account = useAppSelector((state) => state.accounts.get(accountId));

  if (!account) return null;

  return (
    <Permalink
      href={account.url}
      to={`/@${account.acct}`}
      title={`@${account.acct}`}
      data-hover-card-account={account.id}
    >
      <Avatar account={account} size={28} />
    </Permalink>
  );
};

export const AvatarGroup: React.FC<{ accountIds: string[] }> = ({
  accountIds,
}) => (
  <div className='notification-group__avatar-group'>
    {accountIds.slice(0, NOTIFICATIONS_GROUP_MAX_AVATARS).map((accountId) => (
      <AvatarWrapper key={accountId} accountId={accountId} />
    ))}
  </div>
);
