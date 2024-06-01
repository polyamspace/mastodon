import { FormattedMessage } from 'react-intl';

import type { Account } from 'flavours/polyam/models/account';

export const AnniversaryNote: React.FC<{ account: Account }> = ({
  account,
}) => {
  return (
    <div className='account-anniversary-banner'>
      <div className='account-anniversary-banner__message'>
        <FormattedMessage
          id='account.anniversary'
          defaultMessage="It's {acct}'s {years, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} fediversary!"
          values={{
            acct: account.acct,
            years:
              new Date().getFullYear() -
              new Date(account.created_at).getFullYear(),
          }}
        />
      </div>
    </div>
  );
};
