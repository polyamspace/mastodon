import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';

import { connect } from 'react-redux';

import PublicIcon from '@/awesome-icons/solid/globe.svg?react';
import { DismissableBanner } from 'flavours/polyam/components/dismissable_banner';
import { identityContextPropShape, withIdentity } from 'flavours/polyam/identity_context';
import { domain } from 'flavours/polyam/initial_state';

import { addColumn, removeColumn, moveColumn } from '../../actions/columns';
import { connectPublicStream } from '../../actions/streaming';
import { expandPublicTimeline } from '../../actions/timelines';
import Column from '../../components/column';
import ColumnHeader from '../../components/column_header';
import StatusListContainer from '../ui/containers/status_list_container';

import ColumnSettingsContainer from './containers/column_settings_container';

const messages = defineMessages({
  title: { id: 'column.public', defaultMessage: 'Federated timeline' },
});

const mapStateToProps = (state, { columnId }) => {
  const uuid = columnId;
  const columns = state.getIn(['settings', 'columns']);
  const index = columns.findIndex(c => c.get('uuid') === uuid);
  const onlyMedia = (columnId && index >= 0) ? columns.get(index).getIn(['params', 'other', 'onlyMedia']) : state.getIn(['settings', 'public', 'other', 'onlyMedia']);
  const onlyRemote = (columnId && index >= 0) ? columns.get(index).getIn(['params', 'other', 'onlyRemote']) : state.getIn(['settings', 'public', 'other', 'onlyRemote']);
  const allowLocalOnly = (columnId && index >= 0) ? columns.get(index).getIn(['params', 'other', 'allowLocalOnly']) : state.getIn(['settings', 'public', 'other', 'allowLocalOnly']);
  const withReblogs = (columnId && index >= 0) ? columns.get(index).getIn(['params', 'shows', 'reblog']) : state.getIn(['settings', 'public', 'shows', 'reblog']);
  const withReplies = (columnId && index >=0) ? columns.get(index).getIn(['params', 'shows', 'reply']) : state.getIn(['settings', 'public', 'shows', 'reply']);
  const regex = (columnId && index >= 0) ? columns.get(index).getIn(['params', 'regex', 'body']) : state.getIn(['settings', 'public', 'regex', 'body']);
  const timelineState = state.getIn(['timelines', `public${onlyRemote ? ':remote' : allowLocalOnly ? ':allow_local_only' : ''}${withReblogs ? ':reblogs' : ''}${withReplies ? ':replies' : ''}${onlyMedia ? ':media' : ''}`]);

  return {
    hasUnread: !!timelineState && timelineState.get('unread') > 0,
    onlyMedia,
    onlyRemote,
    allowLocalOnly,
    withReblogs,
    withReplies,
    regex,
  };
};

class PublicTimeline extends PureComponent {

  static defaultProps = {
    onlyMedia: false,
  };

  static propTypes = {
    identity: identityContextPropShape,
    dispatch: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    columnId: PropTypes.string,
    multiColumn: PropTypes.bool,
    hasUnread: PropTypes.bool,
    onlyMedia: PropTypes.bool,
    onlyRemote: PropTypes.bool,
    allowLocalOnly: PropTypes.bool,
    withReblogs: PropTypes.bool,
    withReplies: PropTypes.bool,
    regex: PropTypes.string,
  };

  handlePin = () => {
    const { columnId, dispatch, onlyMedia, onlyRemote, allowLocalOnly } = this.props;

    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn(onlyRemote ? 'REMOTE' : 'PUBLIC', { other: { onlyMedia, onlyRemote, allowLocalOnly } }));
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
    const { dispatch, onlyMedia, onlyRemote, allowLocalOnly, withReblogs, withReplies } = this.props;
    const { signedIn } = this.props.identity;

    dispatch(expandPublicTimeline({ onlyMedia, onlyRemote, allowLocalOnly, withReblogs, withReplies }));
    if (signedIn) {
      this.disconnect = dispatch(connectPublicStream({ onlyMedia, onlyRemote, allowLocalOnly, withReblogs, withReplies }));
    }
  }

  componentDidUpdate (prevProps) {
    const { signedIn } = this.props.identity;

    if (prevProps.onlyMedia !== this.props.onlyMedia || prevProps.onlyRemote !== this.props.onlyRemote || prevProps.allowLocalOnly !== this.props.allowLocalOnly || prevProps.withReblogs !== this.props.withReblogs || prevProps.withReplies !== this.props.withReplies) {
      const { dispatch, onlyMedia, onlyRemote, allowLocalOnly, withReblogs, withReplies } = this.props;

      if (this.disconnect) {
        this.disconnect();
      }

      dispatch(expandPublicTimeline({ onlyMedia, onlyRemote, allowLocalOnly, withReblogs, withReplies }));

      if (signedIn) {
        this.disconnect = dispatch(connectPublicStream({ onlyMedia, onlyRemote, allowLocalOnly, withReblogs, withReplies }));
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
    const { dispatch, onlyMedia, onlyRemote, allowLocalOnly, withReblogs, withReplies } = this.props;

    dispatch(expandPublicTimeline({ maxId, onlyMedia, onlyRemote, allowLocalOnly, withReblogs, withReplies }));
  };

  render () {
    const { intl, columnId, hasUnread, multiColumn, onlyMedia, onlyRemote, allowLocalOnly, withReblogs, withReplies } = this.props;
    const pinned = !!columnId;

    return (
      <Column bindToDocument={!multiColumn} ref={this.setRef} name='federated' label={intl.formatMessage(messages.title)}>
        <ColumnHeader
          icon='globe'
          iconComponent={PublicIcon}
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
          prepend={<DismissableBanner id='public_timeline'><FormattedMessage id='dismissable_banner.public_timeline' defaultMessage='These are the most recent public posts from people on the social web that people on {domain} follow.' values={{ domain }} /></DismissableBanner>}
          timelineId={`public${onlyRemote ? ':remote' : (allowLocalOnly ? ':allow_local_only' : '')}${withReblogs ? ':reblogs' : ''}${withReplies ? ':replies' : ''}${onlyMedia ? ':media' : ''}`}
          onLoadMore={this.handleLoadMore}
          trackScroll={!pinned}
          scrollKey={`public_timeline-${columnId}`}
          emptyMessage={<FormattedMessage id='empty_column.public' defaultMessage='There is nothing here! Write something publicly, or manually follow users from other servers to fill it up' />}
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

export default connect(mapStateToProps)(withIdentity(injectIntl(PublicTimeline)));
