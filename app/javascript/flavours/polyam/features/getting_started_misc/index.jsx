import PropTypes from 'prop-types';

import { defineMessages, injectIntl } from 'react-intl';

import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import BanIcon from '@/awesome-icons/solid/ban.svg?react';
import CircleMinusIcon from '@/awesome-icons/solid/circle-minus.svg?react';
import MoreHorizIcon from '@/awesome-icons/solid/ellipsis.svg?react';
import HashtagIcon from '@/awesome-icons/solid/hashtag.svg?react';
import QuestionIcon from '@/awesome-icons/solid/question.svg?react';
import StarIcon from '@/awesome-icons/solid/star.svg?react';
import PinIcon from '@/awesome-icons/solid/thumbtack.svg?react';
import MuteIcon from '@/awesome-icons/solid/volume-xmark.svg?react';
import Column from 'flavours/polyam/features/ui/components/column';
import { ColumnLink } from 'flavours/polyam/features/ui/components/column_link';
import ColumnSubheading from 'flavours/polyam/features/ui/components/column_subheading';
import { identityContextPropShape, withIdentity } from 'flavours/polyam/identity_context';

const messages = defineMessages({
  heading: { id: 'column.heading', defaultMessage: 'Misc' },
  subheading: { id: 'column.subheading', defaultMessage: 'Miscellaneous options' },
  favourites: { id: 'navigation_bar.favourites', defaultMessage: 'Favorites' },
  followed_tags: { id: 'navigation_bar.followed_tags', defaultMessage: 'Followed hashtags' },
  blocks: { id: 'navigation_bar.blocks', defaultMessage: 'Blocked users' },
  domain_blocks: { id: 'navigation_bar.domain_blocks', defaultMessage: 'Blocked domains' },
  mutes: { id: 'navigation_bar.mutes', defaultMessage: 'Muted users' },
  pins: { id: 'navigation_bar.pins', defaultMessage: 'Pinned posts' },
  keyboard_shortcuts: { id: 'navigation_bar.keyboard_shortcuts', defaultMessage: 'Keyboard shortcuts' },
  featured_users: { id: 'navigation_bar.featured_users', defaultMessage: 'Featured users' },
});

class GettingStartedMisc extends ImmutablePureComponent {

  static propTypes = {
    identity: identityContextPropShape,
    intl: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  render () {
    const { intl } = this.props;
    const { signedIn } = this.props.identity;

    return (
      <Column icon='ellipsis-h' iconComponent={MoreHorizIcon} heading={intl.formatMessage(messages.heading)} alwaysShowBackButton>
        <div className='scrollable'>
          <ColumnSubheading text={intl.formatMessage(messages.subheading)} />
          {signedIn && (<ColumnLink key='favourites' icon='star' iconComponent={StarIcon} text={intl.formatMessage(messages.favourites)} to='/favourites' />)}
          {signedIn && (<ColumnLink key='followed_hashtags' icon='hashtag' iconComponent={HashtagIcon} text={intl.formatMessage(messages.followed_tags)} to='/followed_tags' />)}
          {signedIn && (<ColumnLink key='pinned' icon='thumb-tack' iconComponent={PinIcon} text={intl.formatMessage(messages.pins)} to='/pinned' />)}
          {signedIn && (<ColumnLink key='mutes' icon='volume-off' iconComponent={MuteIcon} text={intl.formatMessage(messages.mutes)} to='/mutes' />)}
          {signedIn && (<ColumnLink key='blocks' icon='ban' iconComponent={BanIcon} text={intl.formatMessage(messages.blocks)} to='/blocks' />)}
          {signedIn && (<ColumnLink key='domain_blocks' icon='minus-circle' iconComponent={CircleMinusIcon} text={intl.formatMessage(messages.domain_blocks)} to='/domain_blocks' />)}
          <ColumnLink key='shortcuts' icon='question' iconComponent={QuestionIcon} text={intl.formatMessage(messages.keyboard_shortcuts)} to='/keyboard-shortcuts' />
        </div>
      </Column>
    );
  }

}

export default connect()(withIdentity(injectIntl(GettingStartedMisc)));
