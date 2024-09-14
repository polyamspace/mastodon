import { injectIntl } from 'react-intl';

import { connect } from 'react-redux';

import { NotificationStack } from 'react-notification';

import { dismissAlert } from 'flavours/polyam/actions/alerts';
import { getAlerts } from 'flavours/polyam/selectors';

const mapStateToProps = (state, { intl }) => ({
  notifications: getAlerts(state, { intl }),
});

const mapDispatchToProps = (dispatch) => ({
  onDismiss (alert) {
    dispatch(dismissAlert(alert));
  },
});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(NotificationStack));
