import { connect } from 'react-redux';

import { IconWithBadge } from 'flavours/polyam/components/icon_with_badge';

const mapStateToProps = state => ({
  count: state.getIn(['local_settings', 'notifications', 'tab_badge']) ? state.getIn(['notifications', 'unread']) : 0,
  id: 'bell',
  icon: undefined, // TODO: Replace with proper icon
});

export default connect(mapStateToProps)(IconWithBadge);
