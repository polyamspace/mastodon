import PropTypes from 'prop-types';
import { useCallback } from 'react';

import { FormattedMessage, useIntl, defineMessages } from 'react-intl';

import { Link } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import FollowIcon from '@/awesome-icons/solid/user-plus.svg?react';
import UnfollowIcon from '@/awesome-icons/solid/user-xmark.svg?react';
import CloseIcon from '@/awesome-icons/solid/xmark.svg?react';
import { followAccount, unfollowAccount } from 'flavours/polyam/actions/accounts';
import { dismissSuggestion } from 'flavours/polyam/actions/suggestions';
import { Avatar } from 'flavours/polyam/components/avatar';
import { DisplayName } from 'flavours/polyam/components/display_name';
import { IconButton } from 'flavours/polyam/components/icon_button';
import { domain } from 'flavours/polyam/initial_state';

const messages = defineMessages({
  follow: { id: 'account.follow', defaultMessage: 'Follow' },
  unfollow: { id: 'account.unfollow', defaultMessage: 'Unfollow' },
  dismiss: { id: 'follow_suggestions.dismiss', defaultMessage: "Don't show again" },
});

export const Card = ({ id, source }) => {
  const intl = useIntl();
  const account = useSelector(state => state.getIn(['accounts', id]));
  const relationship = useSelector(state => state.getIn(['relationships', id]));
  const dispatch = useDispatch();
  const following = relationship?.get('following') ?? relationship?.get('requested');

  const handleFollow = useCallback(() => {
    if (following) {
      dispatch(unfollowAccount(id));
    } else {
      dispatch(followAccount(id));
    }
  }, [id, following, dispatch]);

  const handleDismiss = useCallback(() => {
    dispatch(dismissSuggestion({ accountId: id }));
  }, [id, dispatch]);

  let label;

  switch (source) {
  case 'friends_of_friends':
    label = <FormattedMessage id='follow_suggestions.friends_of_friends_longer' defaultMessage='Popular among people you follow' />;
    break;
  case 'similar_to_recently_followed':
    label = <FormattedMessage id='follow_suggestions.similar_to_recently_followed_longer' defaultMessage='Similar to profiles you recently followed' />;
    break;
  case 'featured':
    label = <FormattedMessage id='follow_suggestions.featured_longer' defaultMessage='Hand-picked by the {domain} team' values={{ domain }} />;
    break;
  case 'most_followed':
    label = <FormattedMessage id='follow_suggestions.popular_suggestion_longer' defaultMessage='Popular on {domain}' values={{ domain }} />;
    break;
  case 'most_interactions':
    label = <FormattedMessage id='follow_suggestions.popular_suggestion_longer' defaultMessage='Popular on {domain}' values={{ domain }} />;
    break;
  }

  return (
    <div className='explore__suggestions__card'>
      <div className='explore__suggestions__card__source'>
        {label}
      </div>

      <div className='explore__suggestions__card__body'>
        <Link to={`/@${account.get('acct')}`} data-hover-card-account={account.id}><Avatar account={account} size={48} /></Link>

        <div className='explore__suggestions__card__body__main'>
          <div className='explore__suggestions__card__body__main__name-button'>
            <Link className='explore__suggestions__card__body__main__name-button__name' to={`/@${account.get('acct')}`} data-hover-card-account={account.id}><DisplayName account={account} /></Link>
            <IconButton iconComponent={CloseIcon} onClick={handleDismiss} title={intl.formatMessage(messages.dismiss)} />
            {/* Polyam: Use IconButton instead of FollowButton. TODO: Make a component like FollowButton? */}
            <IconButton iconComponent={following ? UnfollowIcon : FollowIcon} title={intl.formatMessage(following ? messages.unfollow : messages.follow)} active={following} onClick={handleFollow} />
          </div>
        </div>
      </div>
    </div>
  );
};

Card.propTypes = {
  id: PropTypes.string.isRequired,
  source: PropTypes.oneOf(['friends_of_friends', 'similar_to_recently_followed', 'featured', 'most_followed', 'most_interactions']),
};
