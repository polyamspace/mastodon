import PropTypes from 'prop-types';

import { defineMessages, FormattedMessage } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import { debounce } from 'lodash';

import BlockIcon from '@/awesome-icons/solid/ban.svg?react';
import { fetchBlocks, expandBlocks } from '@/flavours/polyam/actions/blocks';
import { injectIntl } from '@/flavours/polyam/components/intl';
import { Account } from '@/flavours/polyam/components/account';
import { Column } from '@/flavours/polyam/components/column';
import { ColumnHeader } from '@/flavours/polyam/components/column/header';
import { LoadingIndicator } from '@/flavours/polyam/components/loading_indicator';
import ScrollableList from '@/flavours/polyam/components/scrollable_list';

const messages = defineMessages({
  heading: { id: 'column.blocks', defaultMessage: 'Blocked users' },
});

const mapStateToProps = state => ({
  accountIds: state.getIn(['user_lists', 'blocks', 'items']),
  hasMore: !!state.getIn(['user_lists', 'blocks', 'next']),
  isLoading: state.getIn(['user_lists', 'blocks', 'isLoading'], true),
});

class Blocks extends ImmutablePureComponent {

  static propTypes = {
    params: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    accountIds: ImmutablePropTypes.list,
    hasMore: PropTypes.bool,
    isLoading: PropTypes.bool,
    intl: PropTypes.object.isRequired,
    multiColumn: PropTypes.bool,
  };

  componentDidMount () {
    this.props.dispatch(fetchBlocks());
  }

  handleLoadMore = debounce(() => {
    this.props.dispatch(expandBlocks());
  }, 300, { leading: true });

  render () {
    const { intl, accountIds, hasMore, multiColumn, isLoading } = this.props;

    if (!accountIds) {
      return (
        <Column>
          <LoadingIndicator />
        </Column>
      );
    }

    const emptyMessage = <FormattedMessage id='empty_column.blocks' defaultMessage="You haven't blocked any users yet." />;

    return (
      <Column bindToDocument={!multiColumn}>
        <ColumnHeader icon='ban' iconComponent={BlockIcon} title={intl.formatMessage(messages.heading)} showBackButton />
        <ScrollableList
          scrollKey='blocks'
          onLoadMore={this.handleLoadMore}
          hasMore={hasMore}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          bindToDocument={!multiColumn}
        >
          {accountIds.map(id =>
            <Account key={id} id={id} defaultAction='block' />,
          )}
        </ScrollableList>
      </Column>
    );
  }

}

export default connect(mapStateToProps)(injectIntl(Blocks));
