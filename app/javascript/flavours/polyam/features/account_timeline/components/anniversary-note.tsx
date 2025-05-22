import { FormattedMessage } from 'react-intl';

import type { Account } from 'flavours/polyam/models/account';

const Fedimation: React.FC = () => (
  <div className='fedimation' aria-hidden>
    <div className='fedi-logo' />
    <div className='fedi-logo' />
    <div className='fedi-logo' />
    <div className='fedi-logo' />
    <div className='fedi-logo' />
  </div>
);

export const AnniversaryNote: React.FC<{ account: Account }> = ({
  account,
}) => {
  return (
    <div className='account-anniversary-banner'>
      <Fedimation />

      <div className='account-anniversary-banner__message'>
        {/*eslint-disable-next-line formatjs/blocklist-elements */}
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
