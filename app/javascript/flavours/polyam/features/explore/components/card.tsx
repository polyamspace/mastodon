import { useCallback } from 'react';

import { FormattedMessage, useIntl, defineMessages } from 'react-intl';

import { Link } from 'react-router-dom';

import CloseIcon from '@/awesome-icons/solid/xmark.svg?react';
import { dismissSuggestion } from 'flavours/polyam/actions/suggestions';
import { Avatar } from 'flavours/polyam/components/avatar';
import { DisplayName } from 'flavours/polyam/components/display_name';
import { FollowIconButton } from 'flavours/polyam/components/follow_icon_button';
import { IconButton } from 'flavours/polyam/components/icon_button';
import { domain } from 'flavours/polyam/initial_state';
import { useAppDispatch, useAppSelector } from 'flavours/polyam/store';

const messages = defineMessages({
  dismiss: {
    id: 'follow_suggestions.dismiss',
    defaultMessage: "Don't show again",
  },
});

type SuggestionSource =
  | 'friends_of_friends'
  | 'similar_to_recently_followed'
  | 'featured'
  | 'most_followed'
  | 'most_interactions';

export const Card: React.FC<{ id: string; source: SuggestionSource }> = ({
  id,
  source,
}) => {
  const intl = useIntl();
  const account = useAppSelector((state) => state.accounts.get(id));
  const dispatch = useAppDispatch();

  const handleDismiss = useCallback(() => {
    void dispatch(dismissSuggestion({ accountId: id }));
  }, [id, dispatch]);

  let label;

  switch (source) {
    case 'friends_of_friends':
      label = (
        <FormattedMessage
          id='follow_suggestions.friends_of_friends_longer'
          defaultMessage='Popular among people you follow'
        />
      );
      break;
    case 'similar_to_recently_followed':
      label = (
        <FormattedMessage
          id='follow_suggestions.similar_to_recently_followed_longer'
          defaultMessage='Similar to profiles you recently followed'
        />
      );
      break;
    case 'featured':
      label = (
        <FormattedMessage
          id='follow_suggestions.featured_longer'
          defaultMessage='Hand-picked by the {domain} team'
          values={{ domain }}
        />
      );
      break;
    case 'most_followed':
      label = (
        <FormattedMessage
          id='follow_suggestions.popular_suggestion_longer'
          defaultMessage='Popular on {domain}'
          values={{ domain }}
        />
      );
      break;
    case 'most_interactions':
      label = (
        <FormattedMessage
          id='follow_suggestions.popular_suggestion_longer'
          defaultMessage='Popular on {domain}'
          values={{ domain }}
        />
      );
      break;
  }

  if (!account) {
    return null;
  }

  return (
    <div className='explore-suggestions-card'>
      <div className='explore-suggestions-card__source'>{label}</div>

      <div className='explore-suggestions-card__body'>
        <Link
          to={`/@${account.get('acct')}`}
          data-hover-card-account={account.id}
          className='explore-suggestions-card__link'
        >
          <Avatar
            account={account}
            size={48}
            className='explore-suggestions-card__avatar'
          />
          <DisplayName account={account} />
        </Link>
        <div className='explore-suggestions-card__actions'>
          <IconButton
            icon='close'
            iconComponent={CloseIcon}
            onClick={handleDismiss}
            title={intl.formatMessage(messages.dismiss)}
            className='explore-suggestions-card__dismiss-button'
          />
          {/* Polyam: Icon buttons instead of text */}
          <FollowIconButton accountId={account.get('id')} />
        </div>
      </div>
    </div>
  );
};
