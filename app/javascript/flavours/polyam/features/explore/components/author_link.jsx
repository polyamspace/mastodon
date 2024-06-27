import PropTypes from 'prop-types';

import { Avatar } from 'flavours/polyam/components/avatar';
import { Permalink } from 'flavours/polyam/components/permalink';
import { useAppSelector } from 'flavours/polyam/store';

export const AuthorLink = ({ accountId }) => {
  const account = useAppSelector(state => state.getIn(['accounts', accountId]));

  if (!account) {
    return null;
  }

  return (
    <Permalink href={account.get('url')} to={`/@${account.get('acct')}`} className='story__details__shared__author-link'>
      <Avatar account={account} size={16} />
      <bdi dangerouslySetInnerHTML={{ __html: account.get('display_name_html') }} />
    </Permalink>
  );
};

AuthorLink.propTypes = {
  accountId: PropTypes.string.isRequired,
};
