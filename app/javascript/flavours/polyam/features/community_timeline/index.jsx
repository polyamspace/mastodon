import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';

import { connect } from 'react-redux';

import PeopleIcon from '@/awesome-icons/solid/users.svg?react';
import { DismissableBanner } from 'flavours/polyam/components/dismissable_banner';
import { identityContextPropShape, withIdentity } from 'flavours/polyam/identity_context';
import { domain } from 'flavours/polyam/initial_state';

import { addColumn, removeColumn, moveColumn } from '../../actions/columns';
import { connectCommunityStream } from '../../actions/streaming';
import { expandCommunityTimeline } from '../../actions/timelines';
import Column from '../../components/column';
import ColumnHeader from '../../components/column_header';
import StatusListContainer from '../ui/containers/status_list_container';

import ColumnSettingsContainer from './containers/column_settings_container';

const messages = defineMessages({
  title: { id: 'column.community', defaultMessage: 'Local timeline' },
});

const mapStateToProps = (state, { columnId }) => {
  const uuid = columnId;
  const columns = state.getIn(['settings', 'columns']);
  const index = columns.findIndex(c => c.get('uuid') === uuid);
  const onlyMedia = (columnId && index >= 0) ? columns.get(index).getIn(['params', 'other', 'onlyMedia']) : state.getIn(['settings', 'community', 'other', 'onlyMedia']);
  const regex = (columnId && index >= 0) ? columns.get(index).getIn(['params', 'regex', 'body']) : state.getIn(['settings', 'community', 'regex', 'body']);
  const withReblogs = (columnId && index >= 0) ? columns.get(index).getIn(['params', 'shows', 'reblog']) : state.getIn(['settings', 'community', 'shows', 'reblog']);
  const withReplies = (columnId && index >=0) ? columns.get(index).getIn(['params', 'shows', 'reply']) : state.getIn(['settings', 'community', 'shows', 'reply']);
  const timelineState = state.getIn(['timelines', `community${withReblogs ? ':reblogs' : ''}${withReplies ? ':replies' : ''}${onlyMedia ? ':media' : ''}`]);

  return {
    hasUnread: !!timelineState && timelineState.get('unread') > 0,
    onlyMedia,
    withReblogs,
    withReplies,
    regex,
  };
};

class CommunityTimeline extends PureComponent {

  static defaultProps = {
    onlyMedia: false,
  };

  static propTypes = {
    identity: identityContextPropShape,
    dispatch: PropTypes.func.isRequired,
    columnId: PropTypes.string,
    intl: PropTypes.object.isRequired,
    hasUnread: PropTypes.bool,
    multiColumn: PropTypes.bool,
    onlyMedia: PropTypes.bool,
    withReblogs: PropTypes.bool,
    withReplies: PropTypes.bool,
    regex: PropTypes.string,
  };

  handlePin = () => {
    const { columnId, dispatch, onlyMedia } = this.props;

    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn('COMMUNITY', { other: { onlyMedia } }));
    }
  };

  handleMove = (dir) => {
    const { columnId, dispatch } = this.props;
    dispatch(moveColumn(columnId, dir));
  };

  handleHeaderClick = () => {
    this.column.scrollTop();
  };

  componentDidMount () {
    const { dispatch, onlyMedia, withReblogs, withReplies } = this.props;
    const { signedIn } = this.props.identity;

    dispatch(expandCommunityTimeline({ onlyMedia, withReblogs, withReplies }));

    if (signedIn) {
      this.disconnect = dispatch(connectCommunityStream({ onlyMedia, withReblogs, withReplies }));
    }
  }

  componentDidUpdate (prevProps) {
    const { signedIn } = this.props.identity;

    if (prevProps.onlyMedia !== this.props.onlyMedia || prevProps.withReblogs !== this.props.withReblogs || prevProps.withReplies !== this.props.withReplies) {
      const { dispatch, onlyMedia, withReblogs, withReplies } = this.props;

      if (this.disconnect) {
        this.disconnect();
      }

      dispatch(expandCommunityTimeline({ onlyMedia, withReblogs, withReplies }));

      if (signedIn) {
        this.disconnect = dispatch(connectCommunityStream({ onlyMedia, withReblogs, withReplies }));
      }
    }
  }

  componentWillUnmount () {
    if (this.disconnect) {
      this.disconnect();
      this.disconnect = null;
    }
  }

  setRef = c => {
    this.column = c;
  };

  handleLoadMore = maxId => {
    const { dispatch, onlyMedia, withReblogs, withReplies } = this.props;

    dispatch(expandCommunityTimeline({ maxId, onlyMedia, withReblogs, withReplies }));
  };

  render () {
    const { intl, hasUnread, columnId, multiColumn, onlyMedia, withReblogs, withReplies } = this.props;
    const pinned = !!columnId;

    return (
      <Column bindToDocument={!multiColumn} ref={this.setRef} label={intl.formatMessage(messages.title)} name='local'>
        <ColumnHeader
          icon='users'
          iconComponent={PeopleIcon}
          active={hasUnread}
          title={intl.formatMessage(messages.title)}
          onPin={this.handlePin}
          onMove={this.handleMove}
          onClick={this.handleHeaderClick}
          pinned={pinned}
          multiColumn={multiColumn}
        >
          <ColumnSettingsContainer columnId={columnId} />
        </ColumnHeader>

        <StatusListContainer
          prepend={<DismissableBanner id='community_timeline'><FormattedMessage id='dismissable_banner.community_timeline' defaultMessage='These are the most recent public posts from people whose accounts are hosted by {domain}.' values={{ domain }} /></DismissableBanner>}
          trackScroll={!pinned}
          scrollKey={`community_timeline-${columnId}`}
          timelineId={`community${withReblogs ? ':reblogs' : ''}${withReplies ? ':replies' : ''}${onlyMedia ? ':media' : ''}`}
          onLoadMore={this.handleLoadMore}
          emptyMessage={<FormattedMessage id='empty_column.community' defaultMessage='The local timeline is empty. Write something publicly to get the ball rolling!' />}
          bindToDocument={!multiColumn}
          regex={this.props.regex}
        />

        <Helmet>
          <title>{intl.formatMessage(messages.title)}</title>
          <meta name='robots' content='noindex' />
        </Helmet>
      </Column>
    );
  }

}

export default withIdentity(connect(mapStateToProps)(injectIntl(CommunityTimeline)));
