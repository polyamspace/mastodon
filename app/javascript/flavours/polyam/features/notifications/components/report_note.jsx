import PropTypes from 'prop-types';

import { defineMessages, injectIntl } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

import { Avatar } from 'flavours/polyam/components/avatar';
import { RelativeTimestamp } from 'flavours/polyam/components/relative_timestamp';

const messages = defineMessages({
  openReport: { id: 'report_notification.open', defaultMessage: 'Open report' },
});

class ReportNote extends ImmutablePureComponent {

  static propTypes = {
    account: ImmutablePropTypes.record.isRequired,
    reportNote: ImmutablePropTypes.map.isRequired,
    hidden: PropTypes.bool,
    intl: PropTypes.object.isRequired,
  };

  render () {
    const { intl, hidden, reportNote, account } = this.props;

    if (!reportNote) {
      return null;
    }

    if (hidden) {
      return (
        <>
          {reportNote.get('id')}
        </>
      );
    }

    return (
      <div className='notification__report'>
        <div className='notification__report__avatar'>
          <Avatar account={account} size={46} />
        </div>

        <div className='notification__report__details'>
          <div>
            <RelativeTimestamp timestamp={reportNote.get('created_at')} short={false} />
            <br />
            {reportNote.get('content')}
          </div>

          <div className='notification__report__actions'>
            <a href={`/admin/reports/${reportNote.getIn(['report', 'id'])}`} className='button' target='_blank' rel='noopener noreferrer'>{intl.formatMessage(messages.openReport)}</a>
          </div>
        </div>
      </div>
    );
  }

}

export default injectIntl(ReportNote);
