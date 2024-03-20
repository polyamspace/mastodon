import { useCallback } from 'react';

import { FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';
import { Link, Switch, Route, useHistory } from 'react-router-dom';

import { useDispatch } from 'react-redux';

import AddressBookIcon from '@/awesome-icons/regular/address-book.svg?react';
import ArrowRightIcon from '@/awesome-icons/solid/arrow-right.svg?react';
import CopyIcon from '@/awesome-icons/solid/copy.svg?react';
import WriteIcon from '@/awesome-icons/solid/pen-to-square.svg?react';
import FollowIcon from '@/awesome-icons/solid/user-plus.svg?react';
import { focusCompose } from 'flavours/polyam/actions/compose';
import { Icon } from 'flavours/polyam/components/icon';
import Column from 'flavours/polyam/features/ui/components/column';
import { me } from 'flavours/polyam/initial_state';
import { useAppSelector } from 'flavours/polyam/store';
import { assetHost } from 'flavours/polyam/utils/config';
import illustration from 'mastodon/../images/elephant_ui_conversation.svg';

import { Step } from './components/step';
import { Follows } from './follows';
import { Profile } from './profile';
import { Share } from './share';

const Onboarding = () => {
  const account = useAppSelector(state => state.getIn(['accounts', me]));
  const dispatch = useDispatch();
  const history = useHistory();

  const handleComposeClick = useCallback(() => {
    dispatch(focusCompose(history));
  }, [dispatch, history]);

  return (
    <Column>
      <Switch>
        <Route path='/start' exact>
          <div className='scrollable privacy-policy'>
            <div className='column-title'>
              <img src={illustration} alt='' className='onboarding__illustration' />
              <h3><FormattedMessage id='onboarding.start.title' defaultMessage="You've made it!" /></h3>
              <p><FormattedMessage id='onboarding.start.lead' defaultMessage="Your new Mastodon account is ready to go. Here's how you can make the most of it:" /></p>
            </div>

            <div className='onboarding__steps'>
              <Step to='/start/profile' completed={(!account.get('avatar').endsWith('missing.png')) || (account.get('display_name').length > 0 && account.get('note').length > 0)} icon='address-book-o' iconComponent={AddressBookIcon} label={<FormattedMessage id='onboarding.steps.setup_profile.title' defaultMessage='Customize your profile' />} description={<FormattedMessage id='onboarding.steps.setup_profile.body' defaultMessage='Others are more likely to interact with you with a filled out profile.' />} />
              <Step to='/start/follows' completed={(account.get('following_count') * 1) >= 1} icon='user-plus' iconComponent={FollowIcon} label={<FormattedMessage id='onboarding.steps.follow_people.title' defaultMessage='Find at least {count, plural, one {one person} other {# people}} to follow' values={{ count: 7 }} />} description={<FormattedMessage id='onboarding.steps.follow_people.body' defaultMessage="You curate your own home feed. Let's fill it with interesting people." />} />
              <Step onClick={handleComposeClick} completed={(account.get('statuses_count') * 1) >= 1} icon='pencil-square-o' iconComponent={WriteIcon} label={<FormattedMessage id='onboarding.steps.publish_status.title' defaultMessage='Make your first post' />} description={<FormattedMessage id='onboarding.steps.publish_status.body' defaultMessage='Say hello to the world.' values={{ emoji: <img className='emojione' alt='🐘' src={`${assetHost}/emoji/1f418.svg`} /> }} />} />
              <Step to='/start/share' icon='copy' iconComponent={CopyIcon} label={<FormattedMessage id='onboarding.steps.share_profile.title' defaultMessage='Share your profile' />} description={<FormattedMessage id='onboarding.steps.share_profile.body' defaultMessage='Let your friends know how to find you on Mastodon!' />} />
            </div>

            <p className='onboarding__lead'><FormattedMessage id='onboarding.start.skip' defaultMessage="Don't need help getting started?" /></p>

            <div className='onboarding__links'>
              <Link to='/explore' className='onboarding__link'>
                <FormattedMessage id='onboarding.actions.go_to_explore' defaultMessage='Take me to trending' />
                <Icon id='arrow-right' icon={ArrowRightIcon} />
              </Link>

              <Link to='/home' className='onboarding__link'>
                <FormattedMessage id='onboarding.actions.go_to_home' defaultMessage='Take me to my home feed' />
                <Icon id='arrow-right' icon={ArrowRightIcon} />
              </Link>
            </div>
          </div>
        </Route>

        <Route path='/start/profile' component={Profile} />
        <Route path='/start/follows' component={Follows} />
        <Route path='/start/share' component={Share} />
      </Switch>

      <Helmet>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};

export default Onboarding;
