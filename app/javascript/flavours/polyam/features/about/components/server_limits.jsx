import { FormattedMessage } from 'react-intl';

import { useAppSelector } from 'flavours/polyam/store';

export const ServerLimits = () => {
  const maxChars = useAppSelector(state => state.getIn(['server', 'server', 'configuration', 'statuses', 'max_characters'], 500));
  const maxReactions = useAppSelector(state => state.getIn(['server', 'server', 'configuration', 'reactions', 'max_reactions'], 1));
  const maxPollOptions = useAppSelector(state => state.getIn(['server', 'server', 'configuration', 'polls', 'max_options'], 5));
  const maxPollOptionLength = useAppSelector(state => state.getIn(['server', 'server', 'configuration', 'polls', 'max_characters_per_option'], 100));
  const maxPinnedToots = useAppSelector(state => state.getIn(['server', 'server', 'configuration', 'accounts', 'max_pinned_statuses'], 5));
  const maxBioChars = useAppSelector(state => state.getIn(['server', 'server', 'configuration', 'accounts', 'max_bio_chars'], 500));
  const maxDisplayNameChars= useAppSelector(state => state.getIn(['server', 'server', 'configuration', 'accounts', 'max_display_name_chars'], 30));
  const maxProfileFields = useAppSelector(state => state.getIn(['server', 'server', 'configuration', 'accounts', 'max_profile_fields'], 4));
  const maxImageSize = useAppSelector(state => state.getIn(['server', 'server', 'configuration', 'media_attachments', 'image_size_limit'], 16 * 1048576));
  const maxVideoSize = useAppSelector(state => state.getIn(['server', 'server', 'configuration', 'media_attachments', 'video_size_limit'], 99 * 1048576));

  // Size limits are bytes in state, which isn't useful for displaying
  // Returns size in MB as string
  const mediaLimitString = (size) => {
    return `${size / 1048576}MB`;
  };

  return (
    <div className='about__server-limits'>
      <p>
        <FormattedMessage
          id='about.limits.max_toot_length'
          defaultMessage='Max toot length:'
        />{' '}
        <strong>{maxChars}</strong>
      </p>
      <p>
        <FormattedMessage
          id='about.limits.max_reactions'
          defaultMessage='Max reactions:'
        />{' '}
        <strong>{maxReactions}</strong>
      </p>
      <p>
        <FormattedMessage
          id='about.limits.max_pinned_toots'
          defaultMessage='Max pinned toots:'
        />{' '}
        <strong>{maxPinnedToots}</strong>
      </p>
      <p>
        <FormattedMessage
          id='about.limits.max_bio_length'
          defaultMessage='Max profile bio length:'
        />{' '}
        <strong>{maxBioChars}</strong>
      </p>
      <p>
        <FormattedMessage
          id='about.limits.max_display_name_length'
          defaultMessage='Max display name length:'
        />{' '}
        <strong>{maxDisplayNameChars}</strong>
      </p>
      <p>
        <FormattedMessage
          id='about.limits.max_profile_fields'
          defaultMessage='Max amount of profile fields:'
        />{' '}
        <strong>{maxProfileFields}</strong>
      </p>
      <p>
        <FormattedMessage
          id='about.limits.max_poll_options'
          defaultMessage='Max poll options:'
        />{' '}
        <strong>{maxPollOptions}</strong>
      </p>
      <p>
        <FormattedMessage
          id='about.limits.max_poll_option_length'
          defaultMessage='Max poll option length:'
        />{' '}
        <strong>{maxPollOptionLength}</strong>
      </p>
      <p>
        <FormattedMessage
          id='about.limits.max_image_size'
          defaultMessage='Max image size:'
        />{' '}
        <strong>{mediaLimitString(maxImageSize)}</strong>
      </p>
      <p>
        <FormattedMessage
          id='about.limits.max_video_size'
          defaultMessage='Max video size:'
        />{' '}
        <strong>{mediaLimitString(maxVideoSize)}</strong>
      </p>
    </div>
  );
};
