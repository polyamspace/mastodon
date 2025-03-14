import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';
import { Link, withRouter } from 'react-router-dom';

import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import ListIcon from '@/awesome-icons/solid/list-ul.svg?react';
import EditIcon from '@/awesome-icons/solid/pencil.svg?react';
import TrashIcon from '@/awesome-icons/solid/trash.svg?react';
import { addColumn, removeColumn, moveColumn } from 'flavours/polyam/actions/columns';
import { fetchList } from 'flavours/polyam/actions/lists';
import { openModal } from 'flavours/polyam/actions/modal';
import { connectListStream } from 'flavours/polyam/actions/streaming';
import { expandListTimeline } from 'flavours/polyam/actions/timelines';
import Column from 'flavours/polyam/components/column';
import ColumnHeader from 'flavours/polyam/components/column_header';
import { Icon }  from 'flavours/polyam/components/icon';
import { LoadingIndicator } from 'flavours/polyam/components/loading_indicator';
import BundleColumnError from 'flavours/polyam/features/ui/components/bundle_column_error';
import StatusListContainer from 'flavours/polyam/features/ui/containers/status_list_container';
import { WithRouterPropTypes } from 'flavours/polyam/utils/react_router';

const mapStateToProps = (state, props) => ({
  list: state.getIn(['lists', props.params.id]),
  hasUnread: state.getIn(['timelines', `list:${props.params.id}`, 'unread']) > 0,
});

class ListTimeline extends PureComponent {

  static propTypes = {
    params: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    columnId: PropTypes.string,
    hasUnread: PropTypes.bool,
    multiColumn: PropTypes.bool,
    list: PropTypes.oneOfType([ImmutablePropTypes.map, PropTypes.bool]),
    intl: PropTypes.object.isRequired,
    ...WithRouterPropTypes,
  };

  handlePin = () => {
    const { columnId, dispatch } = this.props;

    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn('LIST', { id: this.props.params.id }));
      this.props.history.push('/');
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
    const { dispatch } = this.props;
    const { id } = this.props.params;

    dispatch(fetchList(id));
    dispatch(expandListTimeline(id));

    this.disconnect = dispatch(connectListStream(id));
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    const { dispatch } = this.props;
    const { id } = nextProps.params;

    if (id !== this.props.params.id) {
      if (this.disconnect) {
        this.disconnect();
        this.disconnect = null;
      }

      dispatch(fetchList(id));
      dispatch(expandListTimeline(id));

      this.disconnect = dispatch(connectListStream(id));
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
    const { id } = this.props.params;
    this.props.dispatch(expandListTimeline(id, { maxId }));
  };

  handleDeleteClick = () => {
    const { dispatch, columnId } = this.props;
    const { id } = this.props.params;

    dispatch(openModal({ modalType: 'CONFIRM_DELETE_LIST', modalProps: { listId: id, columnId }}));
  };

  render () {
    const { hasUnread, columnId, multiColumn, list } = this.props;
    const { id } = this.props.params;
    const pinned = !!columnId;
    const title  = list ? list.get('title') : id;

    if (typeof list === 'undefined') {
      return (
        <Column>
          <div className='scrollable'>
            <LoadingIndicator />
          </div>
        </Column>
      );
    } else if (list === false) {
      return (
        <BundleColumnError multiColumn={multiColumn} errorType='routing' />
      );
    }

    return (
      <Column bindToDocument={!multiColumn} ref={this.setRef} label={title}>
        <ColumnHeader
          icon='list-ul'
          iconComponent={ListIcon}
          active={hasUnread}
          title={title}
          onPin={this.handlePin}
          onMove={this.handleMove}
          onClick={this.handleHeaderClick}
          pinned={pinned}
          multiColumn={multiColumn}
        >
          <div className='column-settings'>
            <section className='column-header__links'>
              <Link to={`/lists/${id}/edit`} className='text-btn column-header__setting-btn'>
                <Icon id='pencil' icon={EditIcon} /> <FormattedMessage id='lists.edit' defaultMessage='Edit list' />
              </Link>

              <button type='button' className='text-btn column-header__setting-btn' tabIndex={0} onClick={this.handleDeleteClick}>
                <Icon id='trash' icon={TrashIcon} /> <FormattedMessage id='lists.delete' defaultMessage='Delete list' />
              </button>
            </section>
          </div>
        </ColumnHeader>

        <StatusListContainer
          trackScroll={!pinned}
          scrollKey={`list_timeline-${columnId}`}
          timelineId={`list:${id}`}
          onLoadMore={this.handleLoadMore}
          emptyMessage={<FormattedMessage id='empty_column.list' defaultMessage='There is nothing in this list yet. When members of this list post new statuses, they will appear here.' />}
          bindToDocument={!multiColumn}
        />

        <Helmet>
          <title>{title}</title>
          <meta name='robots' content='noindex' />
        </Helmet>
      </Column>
    );
  }

}

export default withRouter(connect(mapStateToProps)(ListTimeline));
