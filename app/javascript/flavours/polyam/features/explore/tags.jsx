import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { FormattedMessage } from 'react-intl';

import { withRouter } from 'react-router-dom';

import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { fetchTrendingHashtags } from 'flavours/polyam/actions/trends';
import { DismissableBanner } from 'flavours/polyam/components/dismissable_banner';
import { ImmutableHashtag as Hashtag } from 'flavours/polyam/components/hashtag';
import { LoadingIndicator } from 'flavours/polyam/components/loading_indicator';
import { WithRouterPropTypes } from 'flavours/polyam/utils/react_router';

const mapStateToProps = state => ({
  hashtags: state.getIn(['trends', 'tags', 'items']),
  isLoadingHashtags: state.getIn(['trends', 'tags', 'isLoading']),
});

class Tags extends PureComponent {

  static propTypes = {
    hashtags: ImmutablePropTypes.list,
    isLoading: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
    ...WithRouterPropTypes,
  };

  componentDidMount () {
    const { dispatch, history, hashtags } = this.props;

    // If we're navigating back to the screen, do not trigger a reload
    if (history.action === 'POP' && hashtags.size > 0) {
      return;
    }

    dispatch(fetchTrendingHashtags());
  }

  render () {
    const { isLoading, hashtags } = this.props;

    if (!isLoading && hashtags.isEmpty()) {
      return (
        <div className='explore__links scrollable scrollable--flex'>
          <div className='empty-column-indicator'>
            <FormattedMessage id='empty_column.explore_statuses' defaultMessage='Nothing is trending right now. Check back later!' />
          </div>
        </div>
      );
    }

    return (
      <div className='scrollable explore__links' data-nosnippet>
        {isLoading ? (<LoadingIndicator />) : hashtags.map(hashtag => (
          <Hashtag key={hashtag.get('name')} hashtag={hashtag} />
        ))}
      </div>
    );
  }

}

export default connect(mapStateToProps)(withRouter(Tags));
