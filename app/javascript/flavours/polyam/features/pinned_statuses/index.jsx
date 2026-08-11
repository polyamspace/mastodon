import PropTypes from 'prop-types';

import { defineMessages } from 'react-intl';

import { Helmet } from '@unhead/react/helmet';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import PushPinIcon from '@/awesome-icons/solid/thumbtack.svg?react';
import { fetchPinnedStatuses } from '@/flavours/polyam/actions/pin_statuses';
import { Column } from '@/flavours/polyam/components/column';
import { injectIntl } from '@/flavours/polyam/components/intl';
import StatusList from '@/flavours/polyam/components/status_list';
import { getStatusList } from '@/flavours/polyam/selectors';
import { ColumnHeader } from '@/flavours/polyam/components/column/header';

const messages = defineMessages({
  heading: { id: 'column.pins', defaultMessage: 'Pinned post' },
});

const mapStateToProps = state => ({
  statusIds: getStatusList(state, 'pins'),
  hasMore: !!state.getIn(['status_lists', 'pins', 'next']),
});

class PinnedStatuses extends ImmutablePureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    statusIds: ImmutablePropTypes.list.isRequired,
    intl: PropTypes.object.isRequired,
    hasMore: PropTypes.bool.isRequired,
    multiColumn: PropTypes.bool,
  };

  componentDidMount () {
    this.props.dispatch(fetchPinnedStatuses());
  }

  render () {
    const { intl, statusIds, hasMore, multiColumn } = this.props;

    return (
      <Column bindToDocument={!multiColumn}>
        <ColumnHeader icon='thumb-tack' iconComponent={PushPinIcon} title={intl.formatMessage(messages.heading)} showBackButton />
        <StatusList
          statusIds={statusIds}
          scrollKey='pinned_statuses'
          hasMore={hasMore}
          bindToDocument={!multiColumn}
        />
        <Helmet>
          <meta name='robots' content='noindex' />
        </Helmet>
      </Column>
    );
  }

}

export default connect(mapStateToProps)(injectIntl(PinnedStatuses));
