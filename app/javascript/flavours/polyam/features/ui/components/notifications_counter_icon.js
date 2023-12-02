import { connect } from 'react-redux';

import { faBell } from '@fortawesome/free-solid-svg-icons';

import { IconWithBadge } from 'flavours/polyam/components/icon_with_badge';

const mapStateToProps = state => ({
  count: state.getIn(['local_settings', 'notifications', 'tab_badge']) ? state.getIn(['notifications', 'unread']) : 0,
  id: 'bell',
  icon: faBell,
});

export default connect(mapStateToProps)(IconWithBadge);
